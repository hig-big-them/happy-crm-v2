import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  try {
    // Messages tablosunun kolonlarını kontrol et
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'messages' })
      .single();

    if (error) {
      // Alternatif yöntem - information_schema kullan
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'messages')
        .eq('table_schema', 'public');

      return NextResponse.json({
        success: true,
        method: 'information_schema',
        columns: schemaData,
        error: schemaError
      });
    }

    return NextResponse.json({
      success: true,
      method: 'rpc',
      columns
    });

  } catch (error) {
    console.error('Schema check error:', error);
    
    // Son çare - basit bir select ile test et
    try {
      const { data: testData, error: testError } = await supabase
        .from('messages')
        .select('*')
        .limit(1);

      return NextResponse.json({
        success: true,
        method: 'select_test',
        sample_data: testData,
        error: testError
      });
    } catch (selectError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to check table schema',
        details: error instanceof Error ? error.message : 'Unknown error',
        select_error: selectError instanceof Error ? selectError.message : 'Unknown select error'
      }, { status: 500 });
    }
  }
}
