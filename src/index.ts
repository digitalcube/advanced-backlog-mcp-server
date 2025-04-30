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
  version: "0.1.0",
});

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
