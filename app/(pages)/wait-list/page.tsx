import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WaitingList = () => {
  return (
    <section className="flex h-full min-h-screen w-screen items-center justify-center overflow-hidden py-32">
      <BackgroundLines className="container flex w-full flex-col items-center justify-center px-4 md:h-full">
        <h2 className="relative z-20 py-2 text-center font-sans font-semibold text-5xl tracking-tighter md:py-10 lg:text-8xl">Join the Waitlist</h2>
        <p className="mx-auto max-w-xl text-center text-md text-muted-foreground lg:text-lg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className="relative z-20 mt-10 flex w-full max-w-md items-center gap-3 rounded-full p-1">
          <Input
            className="h-10 w-full rounded-xl border-none bg-muted shadow-none ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-0 active:ring-0"
            placeholder="Enter your email"
          />
          <Button className="h-10 rounded-xl">Join the Waitlist</Button>
        </div>
        <div className="mt-10 flex items-center gap-2">
          <span className="-space-x-2.5 inline-flex items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <Avatar className="size-8" key={index}>
                <AvatarImage alt="placeholder" src={`/images/block/guri3/avatar${index + 1}.png`} />
              </Avatar>
            ))}
          </span>
          <p className="text-muted-foreground/80 tracking-tight">+1000 people already joined</p>
        </div>
      </BackgroundLines>
    </section>
  );
};

export { WaitingList };
