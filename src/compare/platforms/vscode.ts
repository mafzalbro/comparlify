import { PlatformData } from "../types";

export const vscode: PlatformData = {
  name: "VS Code",
  website: "https://code.visualstudio.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg",
  description: "Visual Studio Code (VS Code) is the world's most popular code editor, having achieved a level of dominance that few software tools ever reach. Built by Microsoft, it struck the perfect balance between a lightweight text editor and a full-featured IDE. Its secret sauce is the 'Extension Marketplace,' a massive ecosystem that allows you to turn VS Code into anything from a simple markdown editor to a powerful C++ environment. While AI-native editors like Cursor are gaining ground, VS Code remains the ultimate 'blank canvas'—highly customizable, completely free, and backed by the largest developer community on the planet.",
  rating: 4.8,
  easeOfUse: 4.5,
  featuresRating: 4.9,
  support: 4.0,
  pros: [
    "Completely free and open-source (VS Code core)",
    "Largest ecosystem of extensions in the world",
    "Near-perfect Git integration built-in",
    "Highly optimized and fast performance",
    "Works on every major operating system"
  ],
  cons: [
    "AI features are not 'native' (requires extensions)",
    "Can become bloated with too many extensions",
    "Can't handle extremely large files as well as Sublime Text",
    "Configuring complex environments can take time"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited use", "Extension access", "Git integration", "Terminal"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "Extension Marketplace", categoryName: "Editor", hasFeature: true },
    { featureName: "Integrated Terminal", categoryName: "Workflow", hasFeature: true },
    { featureName: "IntelliSense", categoryName: "AI/Code", hasFeature: true },
    { featureName: "Remote Development", categoryName: "Workflow", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://code.visualstudio.com"
};
