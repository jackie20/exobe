"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTAINER } from "@/lib/layout";

const CONTACT_DETAILS = [
  { icon: Phone, label: "Phone", value: "+27 70 382 1099" },
  { icon: Mail, label: "Email", value: "support@exobe.africa" },
  { icon: Clock, label: "Hours", value: "Mon-Fri: 9AM-5PM" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className={`${CONTAINER} py-12`}>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-2xl font-semibold">Contact us</h1>
          <p className="mt-2 text-muted-foreground">
            Have a question about an order, a vendor application, or something else? Send us a message and
            our team will get back to you within one business day.
          </p>

          <div className="mt-6 space-y-4">
            {CONTACT_DETAILS.map((detail) => (
              <div key={detail.label} className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <detail.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{detail.label}</p>
                  <p className="font-medium">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-8 h-48 overflow-hidden rounded-lg">
            <Image
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop"
              alt="Exobe Africa support team"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border p-6">
          {submitted ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold text-success">Message sent!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Thanks for reaching out — we&apos;ll be in touch shortly.
              </p>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button type="submit" className="w-full">
                Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
