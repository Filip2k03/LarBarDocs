import os

ROOT_DIR = "/Users/stephanfilip/Yamato_project/Labar"

IGNORE_DIRS = {".git", "node_modules", ".vitepress/dist", ".vitepress/cache"}

EXTENSIONS = {
    ".md", ".json", ".js", ".mjs", ".ts", ".go", ".html", 
    ".svg", ".drawio", ".yml", ".yaml", ".py", ".mod", "Dockerfile"
}

def replace_in_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception:
        return

    # Replacements preserving exact casing
    new_content = content.replace("LaBar", "LaBar")
    new_content = new_content.replace("LABAR", "LABAR")
    new_content = new_content.replace("labar", "labar")

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated: {file_path}")

def walk_and_replace():
    for root, dirs, files in os.walk(ROOT_DIR):
        # Filter ignore dirs
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not any(ign in os.path.join(root, d) for ign in IGNORE_DIRS)]
        
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in EXTENSIONS or file in {"Dockerfile", "go.mod"}:
                full_path = os.path.join(root, file)
                replace_in_file(full_path)

if __name__ == "__main__":
    walk_and_replace()
