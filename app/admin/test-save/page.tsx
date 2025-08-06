"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestSavePage() {
  const [result, setResult] = useState<string>('');
  
  const testSave = async () => {
    try {
      setResult('Testing...');
      
      const response = await fetch('/api/admin/test-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult('Error: ' + error.message);
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Save Endpoint</h1>
      <Button onClick={testSave}>Test Save</Button>
      <pre className="mt-4 p-4 bg-gray-100 rounded">{result}</pre>
    </div>
  );
}