import React from "react";
import { Button } from "@/components/ui/button";

const App = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ERPindo - shadcn/ui Test</h1>
      <div className="space-x-4">
        <Button>Default Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </div>
  );
};

export default App;
