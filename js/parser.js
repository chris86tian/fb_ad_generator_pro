/**
 * Parses the raw text response from the OpenAI API to extract ad versions.
 */
export function parseAdVersions(text) {
  console.log("Attempting to parse raw text:", text); // Log input text
  const versions = [];
  if (!text || typeof text !== 'string') {
      console.error("Parsing failed: Input text is invalid.", text);
      return versions;
  }

  // Split by "Version X:" pattern, ignoring case and potential whitespace variations
  const versionBlocks = text.split(/Version\s+\d+\s*:/i);

  // The first element of the split might be introductory text before "Version 1:", so skip it.
  if (versionBlocks.length > 1) {
      versionBlocks.slice(1).forEach((block, index) => {
          const version = { primaryText: "", headline: "", description: "" };
          const lines = block.trim().split('\n');
          let currentPart = null;
          let buffer = []; // Use a buffer for multi-line content

          console.log(`Parsing Block ${index + 1}:`, block.trim()); // Log each block

          lines.forEach(line => {
              const cleanLine = line.trim();
              const lowerLine = cleanLine.toLowerCase();

              if (lowerLine.startsWith("primary text:")) {
                  // If we were buffering for a previous part, join it now.
                  if (currentPart === "primary") version.primaryText = buffer.join('\n').trim();
                  else if (currentPart === "headline") version.headline = buffer.join(' ').trim(); // Headlines likely single line
                  else if (currentPart === "description") version.description = buffer.join(' ').trim(); // Descriptions likely single line

                  currentPart = "primary";
                  buffer = [cleanLine.substring("primary text:".length).trim()]; // Start new buffer
              } else if (lowerLine.startsWith("headline:")) {
                  if (currentPart === "primary") version.primaryText = buffer.join('\n').trim();
                  else if (currentPart === "headline") version.headline = buffer.join(' ').trim();
                  else if (currentPart === "description") version.description = buffer.join(' ').trim();

                  currentPart = "headline";
                  buffer = [cleanLine.substring("headline:".length).trim()];
              } else if (lowerLine.startsWith("description:")) {
                  if (currentPart === "primary") version.primaryText = buffer.join('\n').trim();
                  else if (currentPart === "headline") version.headline = buffer.join(' ').trim();
                  else if (currentPart === "description") version.description = buffer.join(' ').trim();

                  currentPart = "description";
                  buffer = [cleanLine.substring("description:".length).trim()];
              } else if (currentPart && cleanLine) {
                  // Append to the buffer of the current part if it's not empty
                  buffer.push(cleanLine);
              }
          });

          // Capture the last part after the loop finishes
          if (currentPart === "primary") version.primaryText = buffer.join('\n').trim();
          else if (currentPart === "headline") version.headline = buffer.join(' ').trim();
          else if (currentPart === "description") version.description = buffer.join(' ').trim();

          // Basic validation: Only add if at least one part was found
          if (version.primaryText || version.headline || version.description) {
              console.log(`Parsed Version ${index + 1}:`, version); // Log successful parse
              versions.push(version);
          } else {
              console.warn(`Could not parse content for version block ${index + 1}. Block content:`, block.trim());
          }
      });
  } else {
      console.warn("Could not split text into version blocks based on 'Version X:' pattern.");
  }


  if (versions.length === 0) {
      console.warn("Parsing finished, but no valid ad versions were extracted.");
  } else {
      console.log("Successfully parsed versions:", versions);
  }

  return versions;
}
