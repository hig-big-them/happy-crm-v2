import Link from "next/link"
import { Button } from "../../../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getLocaleFromCookie } from "@/lib/i18n/server"
import { DICTS } from "@/lib/i18n/dictionaries"

export default async function AgenciesPage() {
  // Server bileşeninde Supabase istemcisi oluştur
  const cookieStore = await cookies()
  const locale = await getLocaleFromCookie()
  const t = DICTS[locale]
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  
  // Ajansları getir
  const { data: agencies, error } = await supabase
    .from("agencies")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Ajanslar getirilemedi:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t.admin?.agencies.title}</h1>
        <Button asChild>
          <Link href="/admin/agencies/new">{t.admin?.agencies.newAgency}</Link>
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.admin?.agencies.name}</TableHead>
              <TableHead>{t.admin?.agencies.contact}</TableHead>
              <TableHead>{t.admin?.agencies.createdAt}</TableHead>
              <TableHead>{t.admin?.agencies.status}</TableHead>
              <TableHead className="text-right">{t.admin?.agencies.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies && agencies.length > 0 ? (
              agencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell className="font-medium">{agency.name}</TableCell>
                  <TableCell>
                    {agency.contact_information && typeof agency.contact_information === 'object'
                      ? (agency.contact_information as any).name || '-'
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(agency.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${agency.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {agency.is_active ? t.admin?.agencies.active : t.admin?.agencies.inactive}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/agencies/${agency.id}/manage`}>{t.admin?.agencies.manage}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {error ? t.admin?.agencies.error : t.admin?.agencies.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 