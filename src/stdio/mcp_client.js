import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function runClient() {
  console.log("🚀 启动 MCP 客户端...");

  try {
    const transport = new StdioClientTransport({
      command: "node",
      args: ["./src/stdio/mcp_server.js"],
    });

    const client = new Client({
      name: "mcp-client",
      version: "1.0.0",
    });

    console.log("📡 连接到 MCP 服务器...");

    await client.connect(transport);

    console.log("✅ 成功连接到 MCP 服务器!");

    // 列出可用工具
    console.log("\n📋 可用工具:");
    const tools = await client.listTools();
    tools.tools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name}: ${tool.description}`);
    });

    // 读取第一个工具
    const toolName =
      tools.tools.length > 0 ? tools.tools[0].name : "mcpDemo_getTime";

    // 测试不带参数的情况
    console.log("\n🔧 测试1: 不带参数调用 mcpDemo_getTime 工具...");
    let result = await client.callTool({
      name: toolName,
      arguments: {},
    });
    console.log("✅ 调用结果:", result);

    // 测试 format: 'iso' 参数
    console.log("\n🔧 测试2: 使用 format='iso' 调用 mcpDemo_getTime 工具...");
    result = await client.callTool({
      name: toolName,
      arguments: {
        format: "iso",
      },
    });
    console.log("✅ 调用结果:", result);

    // 测试 format: 'utc' 参数
    console.log("\n🔧 测试3: 使用 format='utc' 调用 mcpDemo_getTime 工具...");
    result = await client.callTool({
      name: toolName,
      arguments: {
        format: "utc",
      },
    });
    console.log("✅ 调用结果:", result);

    // 列出可用资源
    console.log("\n📄 可用资源:");
    try {
      const resources = await client.listResources();
      resources.resources.forEach((resource, index) => {
        console.log(
          `  ${index + 1}. ${resource.name}: ${resource.description}`
        );
      });

      // 读取第一个资源
      if (resources.resources.length > 0) {
        console.log("\n📖 读取第一个资源内容:");
        const resourceContent = await client.readResource({
          uri: resources.resources[0].uri,
        });
        console.log("✅ 资源内容:", resourceContent);
      }
    } catch (error) {
      console.log("  暂无可用资源或读取资源时出错:", error.message);
    }

    // 列出可用提示
    console.log("\n💬 可用提示:");
    try {
      const prompts = await client.listPrompts();
      prompts.prompts.forEach((prompt, index) => {
        console.log(`  ${index + 1}. ${prompt.name}: ${prompt.description}`);
      });

      // 获取第一个提示
      if (prompts.prompts.length > 0) {
        console.log("\n💭 获取第一个提示:");
        const promptResult = await client.getPrompt({
          name: prompts.prompts[0].name,
          arguments: {
            question: "现在几点了？",
          },
        });
        console.log("✅ 提示结果:");
        console.log(JSON.stringify(promptResult, null, 2));
      }
    } catch (error) {
      console.log("  暂无可用提示或获取提示时出错:", error.message);
    }

    console.log("\n👋 所有测试完成，退出程序!");
  } catch (error) {
    console.error("❌ MCP 客户端运行出错:", error);
    process.exit(1);
  }
}

// 运行客户端
runClient();
