#!/usr/bin/env python3
"""
Script: install_all.py
Purpose: ONE script to install ALL packages with correct versions
Usage: python install_all.py
"""

import subprocess
import sys
import os
from pathlib import Path
import time

# ============================================
# EXACT VERSIONS FROM YOUR WORKING ENVIRONMENT
# ============================================
PACKAGES = {
    # Core Framework - YOUR EXACT VERSIONS
    "fastapi": "0.104.1",
    "uvicorn": "0.24.0",
    "python-multipart": "0.0.6",
    "pydantic": "2.12.5",  # Your version is working!
    
    # Utilities - YOUR EXACT VERSIONS
    "python-dotenv": "1.0.0",
    "loguru": "0.7.2",
    "requests": "2.31.0",
    "httpx": "0.28.1",
    
    # Image Processing
    "Pillow": "10.1.0",
    
    # Web Scraping
    "beautifulsoup4": "4.14.3",
    "lxml": "6.0.2",
    
    # Sarvam AI
    "sarvamai": "0.1.26",
    
    # Flask Ecosystem (from your generated requirements)
    "Flask": "3.1.3",
    "Jinja2": "3.1.6",
    "MarkupSafe": "3.0.3",
    "Werkzeug": "3.1.6",
    "blinker": "1.9.0",
    "click": "8.3.1",
    "itsdangerous": "2.2.0",
    
    # Redis/Database
    "Redis-Sentinel-Url": "1.0.1",
    "redis": "7.3.0",  # From your uninstall output
    
    # Async Support
    "anyio": "3.7.1",
    "sniffio": "1.3.1",  # From your uninstall
    "h11": "0.16.0",     # From your uninstall
    "httpcore": "1.0.9", # From your uninstall
    
    # Date/Time
    "arrow": "1.4.0",
    "croniter": "6.0.0",
    "python-dateutil": "2.9.0.post0",  # From your uninstall
    "pytz": "2026.1.post1",  # From your uninstall
    "tzdata": "2025.3",  # From your uninstall
    
    # Type Annotations
    "annotated-types": "0.7.0",
    "typing-extensions": "4.15.0",  # From your uninstall
    "typing-inspection": "0.4.2",  # From your uninstall
    
    # HTTP/Network
    "certifi": "2026.2.25",
    "charset-normalizer": "3.4.5",
    "idna": "3.11",  # From your uninstall
    "urllib3": "2.6.3",  # From your uninstall
    
    # YAML
    "PyYAML": "6.0.1",
    
    # Additional from your environment
    "starlette": "0.27.0",  # From your uninstall
    "pydantic_core": "2.41.5",  # From your uninstall
    "six": "1.17.0",  # From your uninstall
    "soupsieve": "2.8.3",  # From your uninstall
    "websockets": "16.0",  # From your uninstall
    "rq": "2.7.0",  # From your uninstall
    "rq-dashboard": "0.8.6",  # From your uninstall
}

def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 70)
    print(f" 🔧 {text}")
    print("=" * 70)

def print_step(text):
    """Print step with emoji"""
    print(f"\n⏳ {text}")

def print_success(text):
    """Print success message"""
    print(f"   ✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"   ❌ {text}")

def print_warning(text):
    """Print warning message"""
    print(f"   ⚠️  {text}")

def print_info(text):
    """Print info message"""
    print(f"   ℹ️  {text}")

def run_command(cmd, capture=True, timeout=300):
    """Run a shell command and return output"""
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
            return result.stdout, result.stderr, result.returncode
        else:
            result = subprocess.run(cmd, shell=True, timeout=timeout)
            return "", "", result.returncode
    except subprocess.TimeoutExpired:
        return "", "Command timed out", -1
    except Exception as e:
        return "", str(e), -1

def check_venv():
    """Check if virtual environment is active"""
    venv = os.environ.get('VIRTUAL_ENV')
    if not venv:
        print_error("No virtual environment active!")
        print("\nPlease activate your virtual environment first:")
        print("  source venv/bin/activate")
        return False
    print(f"\n📌 Virtual environment: {venv}")
    return True

def upgrade_pip():
    """Upgrade pip to latest version"""
    print_step("Upgrading pip")
    stdout, stderr, code = run_command("python -m pip install --upgrade pip")
    if code == 0:
        ver_stdout, _, _ = run_command("pip --version")
        pip_version = ver_stdout.strip().split()[1] if ver_stdout else "unknown"
        print_success(f"Pip upgraded to version {pip_version}")
        return True
    else:
        print_error(f"Failed to upgrade pip: {stderr[:100]}")
        return False

def install_package(name, version):
    """Install a specific package version with progress"""
    package_str = f"{name}=={version}"
    print(f"    Installing {package_str:<40} ", end="", flush=True)
    
    start_time = time.time()
    stdout, stderr, code = run_command(f"pip install {package_str} --quiet", timeout=120)
    elapsed = time.time() - start_time
    
    if code == 0:
        print(f"✅ ({elapsed:.1f}s)")
        return True
    else:
        print(f"❌")
        if stderr:
            error_msg = stderr.strip().split('\n')[-1][:100]
            print(f"      Error: {error_msg}")
        return False

def install_all_packages():
    """Install all packages in the correct order"""
    print_step("Installing ALL packages")
    
    # Define installation order (dependencies first)
    install_order = [
        # Core dependencies first
        ("Core Dependencies", [
            "certifi",
            "charset-normalizer",
            "idna",
            "urllib3",
            "MarkupSafe",
            "Jinja2",
            "click",
            "blinker",
            "itsdangerous",
            "Werkzeug",
        ]),
        # Type packages
        ("Type Packages", [
            "annotated-types",
            "typing-extensions",
            "typing-inspection",
        ]),
        # Async packages
        ("Async Packages", [
            "anyio",
            "sniffio",
            "h11",
            "httpcore",
        ]),
        # Core framework
        ("Core Framework", [
            "pydantic",
            "pydantic_core",
            "starlette",
            "fastapi",
            "uvicorn",
            "python-multipart",
        ]),
        # HTTP clients
        ("HTTP Clients", [
            "requests",
            "httpx",
        ]),
        # Web scraping
        ("Web Scraping", [
            "soupsieve",
            "beautifulsoup4",
            "lxml",
        ]),
        # Image processing
        ("Image Processing", [
            "Pillow",
        ]),
        # Date/Time
        ("Date/Time", [
            "python-dateutil",
            "pytz",
            "tzdata",
            "arrow",
            "croniter",
        ]),
        # Database
        ("Database", [
            "redis",
            "Redis-Sentinel-Url",
            "rq",
            "rq-dashboard",
        ]),
        # Flask ecosystem
        ("Flask Ecosystem", [
            "Flask",
        ]),
        # YAML
        ("YAML", [
            "PyYAML",
        ]),
        # Utilities
        ("Utilities", [
            "python-dotenv",
            "loguru",
            "six",
        ]),
        # Sarvam AI (needs websockets)
        ("Websockets", [
            "websockets",
        ]),
        ("Sarvam AI", [
            "sarvamai",
        ]),
    ]
    
    successful = []
    failed = []
    total_packages = len(PACKAGES)
    installed_count = 0
    
    for group_name, package_list in install_order:
        print(f"\n  📁 {group_name}:")
        for package_name in package_list:
            if package_name in PACKAGES:
                installed_count += 1
                print(f"    [{installed_count}/{total_packages}] ", end="")
                version = PACKAGES[package_name]
                if install_package(package_name, version):
                    successful.append(package_name)
                else:
                    failed.append(package_name)
            else:
                print_warning(f"Package {package_name} not found in PACKAGES dict")
    
    # Install any remaining packages not in the ordered list
    remaining = set(PACKAGES.keys()) - set(sum([p[1] for p in install_order], []))
    if remaining:
        print(f"\n  📁 Remaining Packages:")
        for package_name in remaining:
            installed_count += 1
            print(f"    [{installed_count}/{total_packages}] ", end="")
            version = PACKAGES[package_name]
            if install_package(package_name, version):
                successful.append(package_name)
            else:
                failed.append(package_name)
    
    return successful, failed

def verify_installation():
    """Verify that all packages can be imported"""
    print_step("Verifying installation")
    
    verification_script = """
import sys
import importlib

packages_to_test = [
    ('fastapi', 'fastapi'),
    ('uvicorn', 'uvicorn'),
    ('pydantic', 'pydantic'),
    ('dotenv', 'python-dotenv'),
    ('loguru', 'loguru'),
    ('requests', 'requests'),
    ('httpx', 'httpx'),
    ('bs4', 'beautifulsoup4'),
    ('lxml', 'lxml'),
    ('PIL', 'Pillow'),
    ('sarvamai', 'sarvamai'),
    ('flask', 'Flask'),
    ('redis', 'redis'),
    ('arrow', 'arrow'),
]

print("\\nTesting imports:")
all_good = True
successful = []
failed = []

for import_name, display_name in packages_to_test:
    try:
        module = importlib.import_module(import_name)
        version = getattr(module, '__version__', 'unknown')
        print(f"  ✅ {display_name:<20} (v{version})")
        successful.append(display_name)
    except ImportError as e:
        print(f"  ❌ {display_name:<20} - Failed: {str(e)[:50]}")
        failed.append(display_name)
        all_good = False

print(f"\\n📊 Summary: {len(successful)}/{len(packages_to_test)} packages imported successfully")
if failed:
    print(f"   Failed: {', '.join(failed)}")

sys.exit(0 if all_good else 1)
"""
    
    with open('_temp_verify.py', 'w') as f:
        f.write(verification_script)
    
    stdout, stderr, code = run_command("python _temp_verify.py")
    print(stdout)
    
    # Clean up
    Path('_temp_verify.py').unlink(missing_ok=True)
    
    return code == 0

def create_requirements_file():
    """Create requirements.txt file"""
    print_step("Creating requirements.txt")
    
    with open('requirements.txt', 'w') as f:
        f.write("# Generated by install_all.py\n")
        f.write(f"# Date: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("# ====================================\n\n")
        
        for name, version in sorted(PACKAGES.items()):
            f.write(f"{name}=={version}\n")
    
    if Path('requirements.txt').exists():
        count = len(open('requirements.txt').readlines()) - 3  # Subtract header lines
        print_success(f"requirements.txt created with {count} packages")
        return True
    else:
        print_error("Failed to create requirements.txt")
        return False

def main():
    try:
        print_header("COMPLETE INSTALLATION SCRIPT")
        print("This script will install ALL packages with EXACT versions from your working environment")
        
        # Check virtual environment
        if not check_venv():
            sys.exit(1)
        
        print(f"📌 Python version: {sys.version.split()[0]}")
        print(f"📌 Packages to install: {len(PACKAGES)}")
        
        # Ask for confirmation
        print("\n📦 Packages to be installed:")
        for i, (name, version) in enumerate(sorted(PACKAGES.items())[:10], 1):
            print(f"   {i:2d}. {name:<25} == {version}")
        print(f"   ... and {len(PACKAGES) - 10} more")
        
        response = input("\nProceed with installation? (Y/n): ")
        if response.lower() == 'n':
            print("\n❌ Installation cancelled")
            sys.exit(0)
        
        # Upgrade pip
        upgrade_pip()
        
        # Install all packages
        successful, failed = install_all_packages()
        
        # Create requirements file
        create_requirements_file()
        
        # Verify installation
        verification_passed = verify_installation()
        
        # Final summary
        print_header("🎉 INSTALLATION COMPLETE")
        print(f"\n📊 Summary:")
        print(f"   • Successfully installed: {len(successful)}/{len(PACKAGES)} packages")
        if failed:
            print(f"   • Failed to install: {len(failed)} packages")
            print(f"     Failed: {', '.join(failed[:5])}")
            if len(failed) > 5:
                print(f"     ... and {len(failed) - 5} more")
        
        print(f"\n📁 Files created:")
        print(f"   • requirements.txt (with all {len(PACKAGES)} packages)")
        
        print(f"\n🔍 Next steps:")
        print(f"   1. Run: python check_environment.py")
        print(f"   2. Start your server: uvicorn api.main:app --reload")
        
        if verification_passed:
            print(f"\n✅ All packages verified successfully!")
        else:
            print(f"\n⚠️  Some packages failed verification")
            print(f"   Run this command to check manually:")
            print(f"   python -c \"import fastapi, pydantic, sarvamai; print('OK')\"")
        
        print("=" * 70)
        
    except KeyboardInterrupt:
        print("\n\n❌ Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()