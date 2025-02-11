import React from 'react';
import { typography } from '@/styles/typography';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

export default function ApiLimitErrorPage() {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={`${typography.h2} flex items-center gap-2`}>
            <AlertCircle className="h-6 w-6 text-red-500" />
            API Limit Reached
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${typography.p} mb-4`}>
            We've reached our API request limit. Please wait a moment and try again.
          </p>
          <p className={`${typography.p} text-muted-foreground`}>
            This usually resolves within a minute. Thank you for your patience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
