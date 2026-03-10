import os

env_path = r"c:\Users\qspar\gemini\antigravity\scratch\zzaenghago\.env.local"
api_key = "AIzaSyC3X4uIF0vd-Gc9zXUOa1oygivWTgPiJ1o"

content = ""
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        content = f.read()

if "GEMINI_API_KEY" in content:
    lines = content.splitlines()
    new_lines = []
    for line in lines:
        if line.startswith("GEMINI_API_KEY="):
            new_lines.append(f"GEMINI_API_KEY=\"{api_key}\"")
        else:
            new_lines.append(line)
    content = "\n".join(new_lines)
else:
    content += f"\nGEMINI_API_KEY=\"{api_key}\"\n"

with open(env_path, "w", encoding="utf-8") as f:
    f.write(content.strip() + "\n")

print(f"Updated {env_path} with Gemini API Key.")
