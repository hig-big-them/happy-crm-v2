"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, Download, Loader2, AlertCircle, FileText } from "lucide-react"
import PostalMime from "postal-mime"
import Papa from "papaparse"

interface LeadData {
  name: string
  phone: string
  email: string
  pipeline: string
  eventDate: string
  eventTime: string
}

export default function EmlImporterPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [parsedLeads, setParsedLeads] = React.useState<LeadData[]>([])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    setError(null)
    setParsedLeads([])

    const parsingPromises = Array.from(files)
      .filter(file => file.name.endsWith(".eml"))
      .map(async file => {
        try {
          const parser = new PostalMime()
          const emlData = await parser.parse(file)
          console.log(`[EML Importer] Parsed EML for ${file.name}:`, emlData)
          const lead = parseLeadFromEml(emlData)
          console.log(`[EML Importer] Extracted lead from ${file.name}:`, lead)
          return lead
        } catch (e) {
          console.error(`[EML Importer] Error parsing file ${file.name}:`, e)
          setError(prev =>
            prev
              ? `${prev}, ${file.name}`
              : `Şu dosya okunamadı: ${file.name}`
          )
          return null
        }
      })
    
    const allLeads = (await Promise.all(parsingPromises)).filter(
      (lead): lead is LeadData => lead !== null
    )

    setParsedLeads(allLeads)
    setIsLoading(false)
  }

  const parseLeadFromEml = (emlData: { text?: string; html?: string }): LeadData | null => {
    const rawContent = emlData.text || emlData.html
    if (!rawContent) {
      console.warn("[EML Importer] EML has no text or html content to parse.")
      return null
    }

    const plainText = rawContent
      .replace(/<[^>]*>?/gm, '')
      .replace(/=\s*(\r?\n|$)/g, '')
      
    console.log("[EML Importer] Cleaned text for parsing:", JSON.stringify(plainText))

    const lines = plainText.split(/[\r\n]+/).map(line => line.trim()).filter(Boolean)

    if (lines.length === 0) {
      console.warn("[EML Importer] No usable lines found after cleaning EML content.")
      return null
    }
    
    console.log("[EML Importer] Split lines for parsing:", lines)

    const lead: Partial<LeadData> = {}
    const candidates: string[] = []

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const phoneRegex = /\+?\d[\d\s-]{7,}\d/
    const timeRegex = /\d{1,2}:\d{2}/
    const dateRegex = /\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)/i

    lines.forEach(line => {
        if (!line || line.length < 3 || line.toLowerCase().startsWith('subject:') || line.toLowerCase().startsWith('from:')) {
            return;
        }

        if (!lead.email && emailRegex.test(line)) {
            lead.email = line.match(emailRegex)?.[0]
        } else if (!lead.phone && phoneRegex.test(line)) {
            lead.phone = line.match(phoneRegex)?.[0]
        } else if (!lead.eventTime && timeRegex.test(line)) {
            lead.eventTime = line.match(timeRegex)?.[0]
        } else if (!lead.eventDate && dateRegex.test(line)) {
            lead.eventDate = line.match(dateRegex)?.[0]
        } else {
            candidates.push(line)
        }
    });
    
    const filteredCandidates = candidates.filter(c => c &&
        (!lead.email || !c.includes(lead.email)) &&
        (!lead.phone || !c.includes(lead.phone))
    );

    if (filteredCandidates.length > 0) {
        const sortedCandidates = filteredCandidates.sort((a,b) => b.length - a.length);
        if (sortedCandidates.length > 0) lead.name = sortedCandidates.shift()
        if (sortedCandidates.length > 0) lead.pipeline = sortedCandidates.shift()
    }

    if (!lead.name && !lead.phone && !lead.email) {
      console.warn("[EML Importer] Could not extract essential lead data (name, phone, email).")
      console.log("[EML Importer] Found lines:", lines)
      console.log("[EML Importer] Partially extracted data:", lead)
      return null
    }

    return {
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      pipeline: lead.pipeline || "Default Pipeline",
      eventDate: lead.eventDate || "26 July",
      eventTime: lead.eventTime || "12:30",
    }
  }

  const handleDownloadCsv = () => {
    if (parsedLeads.length === 0) return

    const csvData = Papa.unparse(parsedLeads, {
      header: true,
      columns: ["name", "phone", "email", "pipeline", "eventDate", "eventTime"],
    })

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", "leads.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          EML Dosyasından Lead İçe Aktarma
        </h1>
        <p className="text-muted-foreground">
          .eml dosyalarını seçerek potansiyel müşterileri toplu olarak içe aktarın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. EML Dosyalarını Yükleyin</CardTitle>
          <CardDescription>
            Lütfen .eml uzantılı dosyalarınızı seçin. Birden fazla dosya
            seçebilirsiniz (1000 adete kadar).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <Label htmlFor="eml-upload" className="cursor-pointer">
              <span className="text-primary hover:underline">
                Dosyaları seçin
              </span>
            </Label>
            <Input
              id="eml-upload"
              type="file"
              accept=".eml"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Sadece .eml dosyaları kabul edilir.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex items-center justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Dosyalar işleniyor, lütfen bekleyin...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {parsedLeads.length > 0 && !isLoading && (
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>2. Önizleme ve İndirme</CardTitle>
                <CardDescription>
                {parsedLeads.length} adet lead başarıyla işlendi.
                </CardDescription>
            </div>
            <Button onClick={handleDownloadCsv}>
              <Download className="mr-2 h-4 w-4" />
              CSV Olarak İndir
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İsim</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pipeline</TableHead>
                    <TableHead>Etkinlik Tarihi</TableHead>
                    <TableHead>Etkinlik Saati</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedLeads.map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.pipeline}</TableCell>
                      <TableCell>{lead.eventDate}</TableCell>
                      <TableCell>{lead.eventTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 