import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContactUsPageProps = {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  web?: { label: string; url: string };
};

const ContactUsPage = ({
  title = "ContactUsPage Us",
  description = "We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!",
  phone = "(123) 34567890",
  email = "email@example.com",
  web = { label: "shadcnblocks.com", url: "https://shadcnblocks.com" },
}: ContactUsPageProps) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="mb-2 font-semibold text-5xl lg:mb-1 lg:text-6xl">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-6 text-center font-semibold text-2xl lg:text-left">ContactUsPage Details</h3>
              <ul className="ml-4 list-disc">
                <li>
                  <span className="font-bold">Phone: </span>
                  {phone}
                </li>
                <li>
                  <span className="font-bold">Email: </span>
                  <a className="underline" href={`mailto:${email}`}>
                    {email}
                  </a>
                </li>
                <li>
                  <span className="font-bold">Web: </span>
                  <a className="underline" href={web.url} target="_blank">
                    {web.label}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border p-10">
            <div className="flex gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="firstname">First Name</Label>
                <Input id="firstname" placeholder="First Name" type="text" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="lastname">Last Name</Label>
                <Input id="lastname" placeholder="Last Name" type="text" />
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Email" type="email" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Subject" type="text" />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Type your message here." />
            </div>
            <Button className="w-full">Send Message</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsPage
