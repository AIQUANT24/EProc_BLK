#!/usr/bin/env python3
"""
Script: clean_all.py
Purpose: Completely clean all installed packages from virtual environment
Usage: python clean_all.py
"""

import subprocess
import sys
import os
from pathlib import Path

def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 60)
    print(f" {text}")
    print("=" * 60)

def print_step(text):
    """Print step with emoji"""
    print(f"\n🔍 {text}")

def run_command(cmd, capture=True):
    """Run a shell command and return output"""
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            return result.stdout, result.stderr, result.returncode
        else:
            result = subprocess.run(cmd, shell=True, timeout=300)
            return "", "", result.returncode
    except subprocess.TimeoutExpired:
        return "", "Command timed out", -1
    except Exception as e:
        return "", str(e), -1

def get_installed_packages():
    """Get list of installed packages (excluding pip, setuptools, wheel)"""
    stdout, _, _ = run_command("pip list --format=freeze")
    packages = []
    for line in stdout.strip().split('\n'):
        if line and not any(x in line for x in ['pip=', 'setuptools=', 'wheel=']):
            packages.append(line)
    return packages

def main():
    try:
        print_header("🧹 CLEANING VIRTUAL ENVIRONMENT")
        
        # Check if virtual environment is active
        venv = os.environ.get('VIRTUAL_ENV')
        if not venv:
            print("\n❌ ERROR: No virtual environment active!")
            print("\nPlease activate your virtual environment first:")
            print("  source venv/bin/activate")
            sys.exit(1)
        
        print(f"\n📌 Active virtual environment: {venv}")
        print(f"📌 Python version: {sys.version.split()[0]}")
        
        # Get current packages
        print_step("Current installed packages")
        packages = get_installed_packages()
        if packages:
            print(f"\nFound {len(packages)} packages:")
            for pkg in packages[:10]:  # Show first 10
                print(f"  • {pkg}")
            if len(packages) > 10:
                print(f"  ... and {len(packages) - 10} more")
        else:
            print("\nNo packages found (environment already clean)")
            response = input("\nContinue anyway? (y/N): ")
            if response.lower() != 'y':
                print("\n❌ Cancelled")
                sys.exit(0)
        
        # Ask for confirmation
        print("\n⚠️  WARNING: This will DELETE ALL packages from your virtual environment!")
        response = input("\nAre you sure you want to continue? (y/N): ")
        if response.lower() != 'y':
            print("\n Cancelled")
            sys.exit(0)
        
        # Create backup
        print_step("Creating backup")
        backup_file = f"requirements.backup.{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.txt"
        stdout, stderr, code = run_command(f"pip freeze > {backup_file}")
        if code == 0 and Path(backup_file).exists():
            print(f"Backup created: {backup_file}")
        else:
            print(f"⚠️  Backup failed: {stderr}")
        
        # Uninstall all packages
        print_step("Uninstalling all packages")
        packages = get_installed_packages()
        if packages:
            print(f"Uninstalling {len(packages)} packages...")
            
            # Create uninstall command
            pkg_names = [pkg.split('==')[0] for pkg in packages]
            cmd = f"pip uninstall -y {' '.join(pkg_names)}"
            
            stdout, stderr, code = run_command(cmd, capture=False)
            if code == 0:
                print("All packages uninstalled successfully")
            else:
                print(f"⚠️  Some errors occurred during uninstallation")
                if stderr:
                    print(f"Error: {stderr[:200]}")
        else:
            print("No packages to uninstall")
        
        # Verify cleanup
        print_step("Verifying cleanup")
        remaining = get_installed_packages()
        if not remaining:
            print("Environment is completely clean!")
        else:
            print(f"⚠️  {len(remaining)} packages remain:")
            for pkg in remaining:
                print(f"  • {pkg}")
        
        # Final summary
        print_header("🎯 CLEANUP COMPLETE")
        print("\nNext steps:")
        print("  1. Run: python install_env.py")
        print("  2. This will reinstall all packages with correct versions")
        print("\nOr run the combined script:")
        print("  python reset_and_install.py")
        print("=" * 60)
        
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

# For timestamp in backup filename
try:
    import pandas as pd
except ImportError:
    from datetime import datetime
    class pd:
        class Timestamp:
            @staticmethod
            def now():
                return datetime.now()

if __name__ == "__main__":
    main()