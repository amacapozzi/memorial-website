import { getUsers, getAllPlans } from "@/actions/admin";
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
import { AssignPlanDialog } from "@/components/admin/assign-plan-dialog";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || "";

  const [{ users, total, totalPages }, plans] = await Promise.all([
    getUsers({ page, search, limit: 20 }),
    getAllPlans(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Manage registered users and their roles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {total} users registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <form>
              <Input
                name="search"
                placeholder="Search by email, name, or chat ID..."
                defaultValue={search}
              />
            </form>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Reminders</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name || "No name"}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email || "No email"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.chatId ? (
                      <span className="text-sm">{user.chatId}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not connected
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.subscription ? (
                        <div>
                          <p className="text-sm">{user.subscription.plan.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {user.subscription.status.toLowerCase()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                      <AssignPlanDialog
                        userId={user.id}
                        userName={user.name}
                        plans={plans.map((p) => ({ id: p.id, name: p.name }))}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{user._count.reminders}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <a
                  href={`?${search ? `search=${search}&` : ""}page=${page - 1}`}
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
                  href={`?${search ? `search=${search}&` : ""}page=${page + 1}`}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
