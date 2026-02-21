import { getContactsData } from "@/actions/contacts";
import { ContactList } from "@/components/contacts";

export default async function ContactsPage() {
  const { contacts, hasWhatsApp } = await getContactsData();

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Contacts
        </h2>
        <p className="text-muted-foreground">
          Manage the contacts you&apos;ve added via WhatsApp.
        </p>
      </div>

      <ContactList contacts={contacts} hasWhatsApp={hasWhatsApp} />
    </div>
  );
}
