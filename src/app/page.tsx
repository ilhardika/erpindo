import { BookOpenCheck, CheckCircle, XCircle, Clock } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface SupabaseStatus {
  connected: boolean;
  url: string;
  error?: string;
  responseTime?: number;
}

async function checkSupabaseStatus(): Promise<SupabaseStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  const startTime = Date.now();

  try {
    // Create Supabase client
    const supabase = createClient(url, key);

    // Test connection with a simple query (check if we can access the auth endpoint)
    const { error } = await supabase.auth.getSession();

    const responseTime = Date.now() - startTime;

    if (error && !error.message.includes("session")) {
      return {
        connected: false,
        url,
        error: error.message,
        responseTime,
      };
    }

    return {
      connected: true,
      url,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      connected: false,
      url,
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime,
    };
  }
}

export default async function Home() {
  const supabaseStatus = await checkSupabaseStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <BookOpenCheck className="text-blue-500" />
          ERPindo - Supabase Status Check
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            {supabaseStatus.connected ? (
              <CheckCircle className="text-green-500 w-8 h-8" />
            ) : (
              <XCircle className="text-red-500 w-8 h-8" />
            )}
            <h2 className="text-xl font-semibold">
              Supabase Connection Status
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Connection Status
              </h3>
              <p
                className={`text-lg font-semibold ${
                  supabaseStatus.connected ? "text-green-600" : "text-red-600"
                }`}
              >
                {supabaseStatus.connected ? "✅ Connected" : "❌ Failed"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Supabase URL</h3>
              <p className="text-sm text-gray-600 break-all">
                {supabaseStatus.url}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Response Time
              </h3>
              <p className="text-lg font-medium text-blue-600">
                {supabaseStatus.responseTime}ms
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Timestamp</h3>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {supabaseStatus.error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
              <p className="text-red-700 text-sm">{supabaseStatus.error}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">
              Environment Variables
            </h3>
            <div className="text-sm text-blue-700">
              <p>
                ✅ NEXT_PUBLIC_SUPABASE_URL:{" "}
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"}
              </p>
              <p>
                ✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:{" "}
                {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
                  ? "Set"
                  : "Missing"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
