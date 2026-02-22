import { getUsersForSelect, getUserEmails } from "@/actions/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PROCESSED: "default",
  REMINDER_CREATED: "default",
  SKIPPED: "secondary",
  FAILED: "destructive",
};

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{
    userId?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const selectedUserId = params.userId ?? "";
  const search = params.search ?? "";
  const page = params.page ? parseInt(params.page) : 1;

  const [users, emailsResult] = await Promise.all([
    getUsersForSelect(),
    selectedUserId
      ? getUserEmails({ userId: selectedUserId, search, page, limit: 20 })
      : Promise.resolve({ emails: [], total: 0, totalPages: 0 }),
  ]);

  const { emails, total, totalPages } = emailsResult;
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const buildQuery = (overrides: Record<string, string>) => {
    const qs = new URLSearchParams({
      ...(selectedUserId && { userId: selectedUserId }),
      ...(search && { search }),
      ...(page > 1 && { page: String(page) }),
      ...overrides,
    });
    return `?${qs.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Emails</h2>
        <p className="text-muted-foreground">
          Browse processed emails for any user.
        </p>
      </div>

      {/* User selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select a user</CardTitle>
          <CardDescription>
            Choose a user to view their processed emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex gap-3">
            <select
              name="userId"
              defaultValue={selectedUserId}
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">— Select a user —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ? `${u.name} (${u.email})` : (u.email ?? u.id)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              View
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Email list */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedUser
                ? (selectedUser.name ?? selectedUser.email ?? selectedUserId)
                : selectedUserId}
            </CardTitle>
            <CardDescription>
              {total} email{total !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <form>
              <input type="hidden" name="userId" value={selectedUserId} />
              <Input
                name="search"
                placeholder="Search by subject, sender, or type..."
                defaultValue={search}
                className="max-w-sm"
              />
            </form>

            {emails.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No emails found.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="max-w-xs truncate font-medium">
                          {email.subject ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {email.sender ?? "—"}
                        </TableCell>
                        <TableCell>
                          {email.emailType ? (
                            <Badge variant="outline" className="capitalize">
                              {email.emailType.toLowerCase()}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              STATUS_VARIANT[email.status] ?? "secondary"
                            }
                          >
                            {email.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(email.receivedAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(email.processedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {page > 1 && (
                      <a
                        href={buildQuery({ page: String(page - 1) })}
                        className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                      >
                        Previous
                      </a>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <a
                        href={buildQuery({ page: String(page + 1) })}
                        className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                      >
                        Next
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
