import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/mullamed22@gmail.com";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;

    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      if (!response.ok) throw new Error("FormSubmit request failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto text-left space-y-5 mb-24">
      <input type="hidden" name="_subject" value="Nuevo mensaje desde el portfolio" />
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="space-y-2">
        <Label htmlFor="contact-name">{t.contact.form.nameLabel}</Label>
        <Input
          id="contact-name"
          name="name"
          required
          placeholder={t.contact.form.namePlaceholder}
          disabled={status === "sending"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">{t.contact.form.emailLabel}</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          placeholder={t.contact.form.emailPlaceholder}
          disabled={status === "sending"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">{t.contact.form.messageLabel}</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder={t.contact.form.messagePlaceholder}
          disabled={status === "sending"}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="animate-spin" /> {t.contact.form.sending}
          </>
        ) : (
          <>
            <Send /> {t.contact.form.send}
          </>
        )}
      </Button>

      {status === "success" && (
        <p role="status" className="text-sm text-primary text-center">
          {t.contact.form.success}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive text-center">
          {t.contact.form.error}
        </p>
      )}
    </form>
  );
}
