#!/usr/bin/env python3
"""
Environment Check Script for BOM Extraction Project
This script checks all installed packages and their versions
"""

import sys
# import pkg_resources
from pathlib import Path
import importlib.metadata
from importlib.metadata import distributions
import json
from datetime import datetime

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

def get_installed_packages():
    """Get all installed packages and their versions"""
    packages = {}
    for dist in distributions():
        packages[dist.metadata['Name']] = dist.version
    return packages

def check_specific_packages():
    """Check specific packages we care about"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'python-multipart',
        'pydantic',
        'python-dotenv',
        'loguru',
        'sarvamai',
        'beautifulsoup4',
        'lxml',
        'pillow',
        'requests',
        'httpx'
    ]
    
    results = {}
    for package in required_packages:
        try:
            version = importlib.metadata.version(package)
            results[package] = {
                'version': version,
                'installed': True,
                'location': get_package_location(package)
            }
        except importlib.metadata.PackageNotFoundError:
            results[package] = {
                'version': None,
                'installed': False,
                'location': None
            }
    
    return results

def get_package_location(package_name):
    """Get the installation location of a package"""
    try:
        dist = importlib.metadata.distribution(package_name)
        if dist:
            return str(dist.locate_file(''))
    except:
        return None

def check_python_version():
    """Check Python version"""
    return {
        'version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        'implementation': sys.implementation.name,
        'executable': sys.executable
    }

def check_venv():
    """Check if running in virtual environment"""
    return {
        'in_venv': sys.prefix != sys.base_prefix,
        'venv_path': sys.prefix,
        'base_python': sys.base_prefix
    }

def check_critical_files():
    """Check if critical project files exist"""
    project_root = Path(__file__).parent.parent
    files_to_check = {
        '.env': project_root / '.env',
        'requirements.txt': project_root / 'requirements.txt',
        'uploads/bom.png': project_root / 'uploads' / 'bom.png'
    }
    
    results = {}
    for name, path in files_to_check.items():
        results[name] = {
            'exists': path.exists(),
            'path': str(path)
        }
    
    return results

def generate_requirements_from_env():
    """Generate requirements.txt content from current environment"""
    packages = get_installed_packages()
    requirements = []
    
    # Sort packages alphabetically
    for package in sorted(packages.keys()):
        if package.lower() not in ['pip', 'setuptools', 'wheel']:  # Skip base packages
            requirements.append(f"{package}=={packages[package]}")
    
    return requirements

def main():
    """Main function to check environment"""
    print("\n" + "="*60)
    print("🔍 BOM EXTRACTION PROJECT - ENVIRONMENT CHECK")
    print("="*60)
    
    # Python Version
    print("\n📌 PYTHON ENVIRONMENT:")
    py_info = check_python_version()
    print(f"   Python Version: {py_info['version']}")
    print(f"   Implementation: {py_info['implementation']}")
    print(f"   Executable: {py_info['executable']}")
    
    # Virtual Environment
    venv_info = check_venv()
    print(f"\n📌 VIRTUAL ENVIRONMENT:")
    print(f"   Active: {'✅ YES' if venv_info['in_venv'] else '❌ NO'}")
    if venv_info['in_venv']:
        print(f"   Venv Path: {venv_info['venv_path']}")
    
    # Check specific packages
    print("\n📌 REQUIRED PACKAGES:")
    packages = check_specific_packages()
    
    # Count installed
    installed_count = sum(1 for p in packages.values() if p['installed'])
    total_count = len(packages)
    
    for package, info in packages.items():
        status = "✅" if info['installed'] else "❌"
        version = f"v{info['version']}" if info['installed'] else "NOT INSTALLED"
        print(f"   {status} {package:<20} {version}")
    
    print(f"\n   📊 Summary: {installed_count}/{total_count} packages installed")
    
    # Check critical files
    print("\n📌 PROJECT FILES:")
    files = check_critical_files()
    for name, info in files.items():
        status = "✅" if info['exists'] else "❌"
        print(f"   {status} {name:<20} {info['path']}")
    
    # Generate requirements
    print("\n📌 GENERATED REQUIREMENTS.TXT:")
    print("   " + "-"*50)
    requirements = generate_requirements_from_env()
    for req in requirements[:15]:  # Show first 15
        print(f"   {req}")
    if len(requirements) > 15:
        print(f"   ... and {len(requirements) - 15} more packages")
    print("   " + "-"*50)
    
    # Save full report
    report = {
        'timestamp': datetime.now().isoformat(),
        'python': py_info,
        'virtual_env': venv_info,
        'packages': packages,
        'files': files,
        'all_packages': get_installed_packages()
    }
    
    report_path = Path(__file__).parent.parent / 'environment_report.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📁 Full report saved to: {report_path}")
    print("\n" + "="*60)
    
    # Check for missing critical packages
    missing = [p for p, info in packages.items() if not info['installed']]
    if missing:
        print("\n⚠️  MISSING PACKAGES:")
        for p in missing:
            print(f"   • {p}")
        print("\n💡 Install missing packages with:")
        print(f"   pip install {' '.join(missing)}")
    else:
        print("\n✅ All required packages are installed!")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    main()