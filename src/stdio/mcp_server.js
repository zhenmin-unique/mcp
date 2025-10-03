import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import http from "http";

// 创建MCP服务器
const server = new McpServer({
  name: "mcp-stdio-server-demo",
  version: "1.0.0",
});

// 定义获取时间工具参数的schema
const schema = z.object({
  format: z
    .enum(["iso", "utc", "full"])
    .optional()
    .describe("时间格式：iso=ISO格式，utc=UTC时间，full=完整日期时间"),
});

// 注册获取时间工具
server.tool(
  "mcpDemo_getTime",
  "获取当前时间，支持多种格式和本地化设置。format参数控制时间显示格式",
  schema.shape,
  async (tool) => {
    const { format } = tool.arguments || {};

    let timeString;
    if (format === "iso") {
      timeString = new Date().toISOString();
    } else if (format === "utc") {
      timeString = new Date().toUTCString();
    } else if (format === "full") {
      timeString = new Date().toLocaleString("zh-CN");
    } else {
      timeString = new Date().toString();
    }

    return {
      content: [
        {
          type: "text",
          text: timeString,
        },
      ],
    };
  }
);

// 创建HTTP服务器提供资源
const PORT = 3000;
const resourceServer = http.createServer((req, res) => {
  if (req.url === "/server-info.json") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify(
        {
          name: "mcp-server-demo",
          version: "1.0.0",
          capabilities: ["tools", "resources", "prompts"],
        },
        null,
        2
      )
    );
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

resourceServer.listen(PORT, () => {
  console.log(`Resource server listening on http://localhost:${PORT}`);
});

// 注册资源示例
server.resource(
  "server-info",
  `http://localhost:${PORT}/server-info.json`,
  {
    description: "服务器信息资源",
    mimeType: "application/json",
  },
  async () => {
    return {
      contents: [
        {
          uri: `http://localhost:${PORT}/server-info.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              name: "mcp-server-demo",
              version: "1.0.0",
              capabilities: ["tools", "resources", "prompts"],
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// 注册提示示例
server.prompt(
  "time-query",
  "帮助用户查询时间的助手提示, 接受一个参数 question, 返回用户的提问",
  z.object({
    question: z.string().describe("用户关于时间的问题"),
  }).shape,
  async ({ question }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `用户询问: ${
              question || "当前时间是多少？"
            }\n助手回答: 当前时间是 ${new Date().toString()}`,
          },
        },
      ],
    };
  }
);

// 设置传输
const transport = new StdioServerTransport();

// 处理连接
await server.connect(transport);
