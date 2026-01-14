console.error("ERROR: ANTHROPIC_API_KEY is missing from process.env");
process.exit(1);
  }

const anthropic = new Anthropic({
  apiKey: key,
});

try {
  console.log("Sending test message to Claude...");
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 100,
    messages: [{ role: "user", content: "Say 'Hello, World!'" }],
  });

  console.log("Success! Response:");
  console.log((message.content[0] as any).text);
} catch (error: any) {
  console.error("API Call Failed:");
  console.error(error.message);
  if (error.status === 401) {
    console.error("This indicates an invalid API key.");
  }
}
}

main();
