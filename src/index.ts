#!/usr/bin/env node
import 'isomorphic-form-data';
import 'isomorphic-fetch';
import * as backlogjs from 'backlog-js';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { BacklogActivityService } from './daily-report-generator/activity-service.js';



const backlog = new backlogjs.Backlog({
    host: process.env.BACKLOG_DOMAIN as string,
    apiKey: process.env.BACKLOG_API_KEY as string
});

/**
 * Create an MCP server
 */
const server = new McpServer({
  name: "advanced_backlog_server",
  description: 'This is a server that can be used to interact with Backlog',
  version: "0.0.1",
});


server.tool(
  "list_backlog_space",
  {},
  async () => {
    const space = await backlog.getSpace();
    return {
      content: [{
        type: "text",
        text: JSON.stringify(space)
      }]
    }
  }
);

server.tool(
  "list_backlog_projects",
  {
    archived: z.boolean().optional().describe("Include archived projects"),
    all: z.boolean().optional().describe("Include all projects"),
  },
  async ({ archived, all }: { archived?: boolean, all?: boolean }) => {
    const projects = await backlog.getProjects({ archived, all });
    return {
      content: [{
        type: "text",
        text: JSON.stringify(projects)
      }]
    }
  }
);

server.tool("list_backlog_recently_viewed_issues",
  {
    order: z.enum(["asc", "desc"]).optional().describe("Order"),
    offset: z.number().optional().describe("Offset"),
    count: z.number().optional().describe("Count"),
  },
  async (query: { order?: "asc" | "desc", offset?: number, count?: number }) => {
    const recentlyViewedIssues = await backlog.getRecentlyViewedIssues(query);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(recentlyViewedIssues)
      }]
    }
  }
);
server.tool("search_backlog_issues", {
  keyword: z.string().describe("Keyword"),
  projectId: z.array(z.number()).describe("Project id"),
  issueTypeId: z.array(z.number()).describe("Issue type id"),
  categoryId: z.array(z.number()).describe("Category id"),
  versionId: z.array(z.number()).describe("Version id"),
  milestoneId: z.array(z.number()).describe("Milestone id"),
  statusId: z.array(z.number()).describe("Status id"),
  priorityId: z.array(z.number()).describe("Priority id"),
  assigneeId: z.array(z.number()).describe("Assignee id"),
  createdUserId: z.array(z.number()).describe("Created user id"),
  resolutionId: z.array(z.number()).describe("Resolution id"),
  parentChild: z.number().describe("Parent child: 0=All, 1=NotChild, 2=Child, 3=NotChildNotParent, 4=Parent"),
  attachment: z.boolean().describe("Attachment"),
  sharedFile: z.boolean().describe("Shared file"),
  sort: z.enum(["issueType", "category", "version", "milestone", "summary", "status", "priority", "attachment", "sharedFile", "created", "createdUser", "updated", "updatedUser", "assignee", "startDate", "dueDate", "estimatedHours", "actualHours", "childIssue"]).describe("Sort"),
  order: z.enum(["asc", "desc"]).describe("Order"),
  offset: z.number().describe("Offset"),
  count: z.number().describe("Count"),
  createdSince: z.string().describe("Created since"),
  createdUntil: z.string().describe("Created until"),
  updatedSince: z.string().describe("Updated since"),
  updatedUntil: z.string().describe("Updated until"),
  startDateSince: z.string().describe("Start date since"),
  startDateUntil: z.string().describe("Start date until"),
  dueDateSince: z.string().describe("Due date since"),
  dueDateUntil: z.string().describe("Due date until"),
  id: z.array(z.number()).describe("Id"),
  parentIssueId: z.array(z.number()).describe("Parent issue id"),
}, async (query) => {
  const issues = await backlog.getIssues(query);
  return {
    content: [{
      type: "text",
      text: JSON.stringify(issues)
    }]
  }
})

server.tool("get_backlog_issue", {
  issueId: z.number().describe("Issue id"),
}, async ({issueId}) => {
  const issue = await backlog.getIssue(issueId);
  return {
    content: [{
      type: "text",
      text: JSON.stringify(issue)
    }]
  }
})

server.tool("list_backlog_recently_viewed_projects",
  {
    order: z.enum(["asc", "desc"]).optional().describe("Order"),
    offset: z.number().optional().describe("Offset"),
    count: z.number().optional().describe("Count"),
  },
  async (query: { order?: "asc" | "desc", offset?: number, count?: number }) => { 
    const recentlyViewedProjects = await backlog.getRecentlyViewedProjects(query);  
    return {
      content: [{
        type: "text",
        text: JSON.stringify(recentlyViewedProjects)
      }]
    }
  }
);
server.tool("get_backlog_project", {
  projectId: z.number().describe("Project id"),
}, async ({projectId}) => {
  const project = await backlog.getProject(projectId);
  return {
    content: [{
      type: "text",
      text: JSON.stringify(project)
    }]
  }
})

server.tool("list_backlog_recently_viewed_wikis",
  {
    order: z.enum(["asc", "desc"]).optional().describe("Order"),
    offset: z.number().optional().describe("Offset"),
    count: z.number().optional().describe("Count"),
  },
  async (query: { order?: "asc" | "desc", offset?: number, count?: number }) => {
    const recentlyViewedWikis = await backlog.getRecentlyViewedWikis(query);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(recentlyViewedWikis) 
      }]
    }
  }
);
server.tool("get_backlog_wiki", {
  wikiId: z.number().describe("Wiki id"),
}, async ({wikiId}) => {
  const wiki = await backlog.getWiki(wikiId);
  return {
    content: [{
      type: "text",
      text: JSON.stringify(wiki)
    }]
  }
})

server.tool("list_backlog_recent_user_activities",
  {
    userId: z.number().describe("User id"),
    activityTypeId: z.array(z.number()).optional().describe("Activity type id"),
    minId: z.number().optional().describe("Min id"),
    maxId: z.number().optional().describe("Max id"),
    count: z.number().optional().describe("Count"),
    order: z.enum(["asc", "desc"]).optional().describe("Order"),
  },
  async ({userId, ...params}: { userId: number, activityTypeId?: number[], minId?: number, maxId?: number, count?: number, order?: "asc" | "desc" }) => {
    const backlogUserId = userId < 1 ? await backlog.getMyself().then(myself => myself.id) : userId;
    const recentUserActivities = await backlog.getUserActivities(backlogUserId, params);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(recentUserActivities)
      }]
    } 
  }
);

server.tool("get_backlog_current_user", {}, async () => {
  const currentUser = await backlog.getMyself();
  return {
    content: [{
      type: "text",
      text: JSON.stringify(currentUser)
    }]
  }
})

server.tool("get_backlog_user", {
  userId: z.number().describe("User id"),
}, async ({userId}) => {
  const user = await backlog.getUser(userId);
  return {
    content: [{
      type: "text",
      text: JSON.stringify(user)
    }]
  }
})

server.tool("list_backlog_users", {}, async () => {
  const users = await backlog.getUsers();
  return {
    content: [{
      type: "text",
      text: JSON.stringify(users)
    }]
  }
})

server.tool("list_backlog_own_notifications", {
  minId: z.number().optional().describe("Min id"),
  maxId: z.number().optional().describe("Max id"),
  count: z.number().optional().describe("Count"),
  order: z.enum(["asc", "desc"]).optional().describe("Order"),
}, async (params: {minId?: number, maxId?: number, count?: number, order?: "asc" | "desc"}) => {
  const notifications = await backlog.getNotifications(params);
  return {
    content: [{
      type: "text",
      text: JSON.stringify(notifications)
    }]
  }
})

server.tool("list_backlog_daily_activities", {
  userId: z.number().describe("User id"),
  date: z.string().describe("Date"),
}, async ({ userId, date }) => {
  const backlogUserId = userId < 1 ? await backlog.getMyself().then(myself => myself.id) : userId;
  const service = new BacklogActivityService(backlog);
  const activities = await service.getMeaningfulActivities(backlogUserId, date);
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        ...activities,
        report: undefined
      })
    }]
  }
})
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
