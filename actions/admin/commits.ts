"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export type CommitRow = {
  id: string;
  sha: string;
  message: string;
  author: string;
  url: string;
  repository: string;
  branch: string;
  timestamp: Date;
};

export type GetCommitsParams = {
  page?: number;
  limit?: number;
  search?: string;
  repository?: string;
  branch?: string;
};

export async function getCommits(params: GetCommitsParams = {}) {
  const session = await checkAdminAuth();
  if (!session) {
    return { commits: [], total: 0, page: 1, totalPages: 0 };
  }

  const { page = 1, limit = 20, search, repository, branch } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { message: { contains: search, mode: "insensitive" as const } },
        { author: { contains: search, mode: "insensitive" as const } },
        { sha: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(repository && { repository }),
    ...(branch && { branch }),
  };

  const [commits, total] = await Promise.all([
    prisma.commit.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        sha: true,
        message: true,
        author: true,
        url: true,
        repository: true,
        branch: true,
        timestamp: true,
      },
    }),
    prisma.commit.count({ where }),
  ]);

  return {
    commits: commits as CommitRow[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCommitFilterOptions() {
  const session = await checkAdminAuth();
  if (!session) {
    return { repositories: [], branches: [] };
  }

  const [repositoryResults, branchResults] = await Promise.all([
    prisma.commit.findMany({
      select: { repository: true },
      distinct: ["repository"],
      orderBy: { repository: "asc" },
    }),
    prisma.commit.findMany({
      select: { branch: true },
      distinct: ["branch"],
      orderBy: { branch: "asc" },
    }),
  ]);

  return {
    repositories: repositoryResults.map((r) => r.repository),
    branches: branchResults.map((b) => b.branch),
  };
}
