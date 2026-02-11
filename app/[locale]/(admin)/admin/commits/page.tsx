import { getCommits, getCommitFilterOptions } from "@/actions/admin";
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
import { CommitFilters } from "@/components/admin/commit-filters";

export default async function AdminCommitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    repository?: string;
    branch?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || "";
  const repository = params.repository || "";
  const branch = params.branch || "";

  const [{ commits, total, totalPages }, filterOptions] = await Promise.all([
    getCommits({ page, search, repository, branch, limit: 20 }),
    getCommitFilterOptions(),
  ]);

  function buildPageUrl(targetPage: number) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (repository) p.set("repository", repository);
    if (branch) p.set("branch", branch);
    p.set("page", String(targetPage));
    return `?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Commits</h2>
        <p className="text-muted-foreground">
          GitHub commits tracked via webhook.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Commits</CardTitle>
          <CardDescription>{total} commits tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <form className="flex-1">
              <Input
                name="search"
                placeholder="Search by message, author, or SHA..."
                defaultValue={search}
              />
              {repository && (
                <input type="hidden" name="repository" value={repository} />
              )}
              {branch && (
                <input type="hidden" name="branch" value={branch} />
              )}
            </form>
            <CommitFilters
              repositories={filterOptions.repositories}
              branches={filterOptions.branches}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SHA</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commits.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No commits found.
                  </TableCell>
                </TableRow>
              ) : (
                commits.map((commit) => (
                  <TableRow key={commit.id}>
                    <TableCell>
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-500 hover:underline"
                      >
                        {commit.sha.slice(0, 7)}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {commit.message.split("\n")[0]}
                    </TableCell>
                    <TableCell>{commit.author}</TableCell>
                    <TableCell>
                      <span className="text-sm">{commit.repository}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{commit.branch}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(commit.timestamp).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <a
                  href={buildPageUrl(page - 1)}
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
                  href={buildPageUrl(page + 1)}
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
