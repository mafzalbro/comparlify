import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Get in Touch
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            We'd love to hear from you! Whether you have a question, feedback, or a partnership proposal, feel free to reach out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">Email</h3>
                <p className="text-muted-foreground">Send us an email for general inquiries.</p>
                <a href="mailto:hello@comparlify.com" className="text-primary font-medium hover:underline">hello@comparlify.com</a>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">Phone</h3>
                <p className="text-muted-foreground">Give us a call during business hours.</p>
                <a href="tel:+1234567890" className="text-primary font-medium hover:underline">+1 (234) 567-890</a>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">Office</h3>
                <p className="text-muted-foreground">123 Creator Lane, Suite 100<br/>Innovation City, 12345</p>
              </div>
            </div>
          </div>
          
          <form className="space-y-6 bg-card p-8 rounded-lg shadow-md">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="How can we help you?" rows={5} />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
