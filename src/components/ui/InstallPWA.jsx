import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  // Default to true so the button is hidden by default until we confirm it's installable
  const [isInstalled, setIsInstalled] = useState(true); 

  useEffect(() => {
    // 1. Check if the app is already running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true ||
        localStorage.getItem("rydex_pwa_installed") === "true";
        
      setIsInstalled(isStandalone);
    };
    
    checkStandalone();

    // 2. Listen for the install prompt
    const handler = (e) => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
      
      // If we get the prompt, we are definitely not installed yet
      if (!window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone) {
        setIsInstalled(false);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);

    // 3. Listen for the successful install event
    const handleAppInstalled = () => {
      setSupportsPWA(false); // Hide instantly
      setIsInstalled(true);
      localStorage.setItem("rydex_pwa_installed", "true");
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const onClick = async (evt) => {
    evt.preventDefault();
    if (!promptInstall) return;
    
    promptInstall.prompt();
    const { outcome } = await promptInstall.userChoice;
    
    // Hide the button immediately upon acceptance
    if (outcome === "accepted") {
      setSupportsPWA(false);
      setIsInstalled(true);
      localStorage.setItem("rydex_pwa_installed", "true");
    }
  };

  // If it's already installed or the browser doesn't support the prompt, hide it
  if (!supportsPWA || isInstalled) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-lime hover:bg-lime/10 rounded-full transition"
      title="Install RydEx App"
    >
      <Download size={16} /> 
      <span className="hidden lg:inline">Install App</span>
    </button>
  );
}
