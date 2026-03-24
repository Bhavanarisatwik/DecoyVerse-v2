import { LifeBuoy, Mail, MessageSquare, FileText, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

export default function HelpCenter() {
  const supportCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of deploying your first decoy node.",
      icon: FileText,
      href: "/docs",
      color: "text-blue-400"
    },
    {
      title: "Community Forum",
      description: "Join our community of security researchers to discuss strategies.",
      icon: MessageSquare,
      href: "#",
      color: "text-green-400"
    },
    {
      title: "Contact Support",
      description: "Need help with a production deployment? Open a ticket.",
      icon: Mail,
      href: "mailto:support@decoyverse.local",
      color: "text-orange-400"
    }
  ];

  const faqs = [
    {
      question: "How do I deploy a new agent node?",
      answer: "Navigate to the Nodes page and click 'Add Node'. After generating your Node ID and API Key, you can download the configuration file to your target server and run the agent."
    },
    {
      question: "Are email notifications instantaneous?",
      answer: "Yes, our risk algorithms process alerts locally and immediately route critical events through our SMTP transport layer."
    },
    {
      question: "Can I use DecoyVerse offline?",
      answer: "Agent nodes require a connection to the FastAPI ML backend to relay heartbeat telemetry and trigger actions. An air-gapped environment currently isn't supported out-of-the-box without network tunnels."
    },
    {
      question: "How do I update my profile?",
      answer: "Click on Settings in the Tools menu to update your personal details, profile image, and toggle global application preferences like the UI Theme."
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-themed-primary flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-accent" />
          Help Center
        </h1>
        <p className="text-themed-muted mt-2">Find answers, documentation, and get support for your deployments.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {supportCategories.map((category) => (
          <a
            key={category.title}
            href={category.href}
            className="group block p-6 rounded-xl border border-gray-700 bg-gray-800 hover:bg-themed-elevated hover:border-accent/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <category.icon className={cn("h-8 w-8", category.color)} />
              <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-accent transition-colors" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-themed-primary group-hover:text-accent transition-colors">{category.title}</h3>
            <p className="mt-2 text-sm text-themed-muted">{category.description}</p>
          </a>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6 text-themed-primary">Frequently Asked Questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 rounded-xl border border-gray-700 bg-gray-800/50">
              <h3 className="text-base font-medium text-themed-primary">{faq.question}</h3>
              <p className="mt-2 text-sm text-themed-muted leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
