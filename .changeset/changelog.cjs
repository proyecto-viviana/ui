function linkifyIssueRefs(line, options) {
  if (!options || !options.repo) {
    return line;
  }

  const serverUrl = options.serverUrl || "https://github.com";

  return line.replace(/\[.*?\]\(.*?\)|\B#([1-9]\d*)\b/g, (match, issue) => {
    if (!issue) {
      return match;
    }

    return `[#${issue}](${serverUrl}/${options.repo}/issues/${issue})`;
  });
}

function formatSummary(summary, options) {
  const [firstLine = "", ...futureLines] = summary
    .trim()
    .split("\n")
    .map((line) => line.trimEnd());

  const formatted = [`- ${linkifyIssueRefs(firstLine, options)}`];

  for (const line of futureLines) {
    formatted.push(`  ${linkifyIssueRefs(line, options)}`);
  }

  return formatted.join("\n");
}

async function getReleaseLine(changeset, _type, options) {
  const commitPrefix = changeset.commit ? `${changeset.commit.slice(0, 7)}: ` : "";
  const summary = formatSummary(changeset.summary, options);

  if (!commitPrefix) {
    return summary;
  }

  return summary.replace(/^- /, `- ${commitPrefix}`);
}

async function getDependencyReleaseLine(changesets, dependenciesUpdated) {
  if (dependenciesUpdated.length === 0) {
    return "";
  }

  const changesetLines = changesets.map((changeset) => {
    const commitSuffix = changeset.commit ? ` ${changeset.commit.slice(0, 7)}` : "";
    return `- Updated dependencies${commitSuffix}:`;
  });

  const dependencyLines = dependenciesUpdated.map(
    (dependency) => `  - ${dependency.name}@${dependency.newVersion}`,
  );

  return [...changesetLines, ...dependencyLines].join("\n");
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine,
};
