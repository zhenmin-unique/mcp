import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function runClient() {
  console.log("🚀 启动 MCP 客户端...");

  try {
    // 创建HTTP客户端传输
    const transport = new StreamableHTTPClientTransport(
      new URL("http://localhost:3002/mcp")
    );

    const client = new Client({
      name: "mcp-streamable-client",
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

    // 测试不带参数的情况
    console.log("\n🔧 测试1: 不带参数调用 mcpDemo_getTime 工具...");
    let result = await client.callTool({
      name: "mcpDemo_getTime",
      arguments: {},
    });
    console.log("✅ 调用结果:", result);

    // 测试 format: 'iso' 参数
    console.log("\n🔧 测试2: 使用 format='iso' 调用 mcpDemo_getTime 工具...");
    result = await client.callTool({
      name: "mcpDemo_getTime",
      arguments: {
        format: "iso",
      },
    });
    console.log("✅ 调用结果:", result);

    // 测试 format: 'utc' 参数
    console.log("\n🔧 测试3: 使用 format='utc' 调用 mcpDemo_getTime 工具...");
    result = await client.callTool({
      name: "mcpDemo_getTime",
      arguments: {
        format: "utc",
      },
    });
    console.log("✅ 调用结果:", result);

    // 测试 format: 'full' 参数
    console.log("\n🔧 测试4: 使用 format='full' 调用 mcpDemo_getTime 工具...");
    result = await client.callTool({
      name: "mcpDemo_getTime",
      arguments: {
        format: "full",
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
        console.log("✅ 资源内容:");
        console.log(JSON.stringify(resourceContent, null, 2));
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

    // 关闭连接
    await client.close();
    console.log("\n👋 客户端已关闭");
  } catch (error) {
    console.error("❌ 客户端运行出错:", error);
  }
}

// 提取文本结果的辅助函数
function extractTextResult(result) {
  if (result && result.content) {
    if (Array.isArray(result.content)) {
      return result.content
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n");
    } else if (typeof result.content === "string") {
      return result.content;
    }
  }
  return result;
}

runClient();
