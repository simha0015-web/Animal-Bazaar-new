

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allDistricts, states, locations, State } from '@/lib/definitions';


export default function RegisterPage() {
  const { login } = useAuth();
  const [selectedState, setSelectedState] = useState<State | ''>('');
  
  const districts = useMemo(() => {
    if (!selectedState || selectedState === "all") return allDistricts;
    return locations[selectedState as State] || [];
  }, [selectedState]);


  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would register the user and then log them in.
    login('+91 9876543210');
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Create an account to start selling.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Gmail</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+91 98xxxxxxxx" required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="postState">State</Label>
                    <Select name="state" onValueChange={(value) => setSelectedState(value as State)} required>
                    <SelectTrigger id="postState">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="postLocation">District</Label>
                    <Select name="location" required disabled={!selectedState}>
                    <SelectTrigger id="postLocation">
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                        {districts.map((district, index) => (
                        <SelectItem key={`${district}-${index}`} value={district}>{district}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="village">Village/Town</Label>
                    <Input id="village" placeholder="Your Village" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pincode">Pin Code</Label>
                    <Input id="pincode" type="text" placeholder="e.g., 500001" required />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <Label
                htmlFor="terms"
                className="text-sm font-normal text-muted-foreground"
              >
                I agree to the{' '}
                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">Create account</Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline text-primary">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
