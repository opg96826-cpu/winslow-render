#!/usr/bin/env python3
"""
Render Winslow video on Kaggle GPU using Remotion
"""
import os
import subprocess
import sys
import shutil

def run_cmd(cmd, cwd=None):
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    return result

def main():
    # Kaggle push -p puts files directly in /kaggle/working
    work_dir = "/kaggle/working"
    
    print("Contents of /kaggle/working:")
    try:
        for item in os.listdir(work_dir):
            print(f"  {item}")
    except Exception as e:
        print(f"Error listing directory: {e}")
    
    # Verify package.json exists in working dir (where push puts it)
    if not os.path.exists(os.path.join(work_dir, "package.json")):
        print("ERROR: package.json not found in /kaggle/working")
        sys.exit(1)
    
    # Install node dependencies
    print("Installing npm dependencies...")
    result = run_cmd("npm install", cwd=work_dir)
    if result.returncode != 0:
        print("npm install failed")
        sys.exit(1)
    
    # Run the render
    print("Starting Remotion render...")
    result = run_cmd(
        'npx remotion render Winslow out.mp4 --gl=swangle --concurrency=4 --muted',
        cwd=work_dir
    )
    
    if result.returncode == 0:
        print("Render completed successfully!")
        # Output is already in working dir
        output_path = os.path.join(work_dir, "out.mp4")
        if os.path.exists(output_path):
            print(f"Output ready at {output_path}")
    else:
        print(f"Render failed with exit code {result.returncode}")
        sys.exit(1)

if __name__ == "__main__":
    main()