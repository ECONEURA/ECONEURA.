"""
Test standalone para verificar advanced_tools.py
"""
import sys
import os

# Agregar path para imports
sys.path.insert(0, os.path.dirname(__file__))

print("🔍 Testing advanced_tools imports...")

try:
    from advanced_tools import advanced_tools
    print("✅ advanced_tools importado OK")
    
    # Test get_available_tools
    tools = advanced_tools.get_available_tools()
    print(f"✅ get_available_tools() retorna {len(tools)} tools")
    
    for tool in tools:
        print(f"   - {tool['function']['name']}")
    
except ImportError as e:
    print(f"❌ Error importando: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

print("\n🔍 Testing context_memory imports...")

try:
    from context_memory import context_memory
    print("✅ context_memory importado OK")
    
    # Test add_message
    context_memory.add_message("test_user", "user", "Hello test", {})
    print("✅ add_message() funciona")
    
    # Test get_context
    messages = context_memory.get_context("test_user")
    print(f"✅ get_context() retorna {len(messages)} mensajes")
    
    # Test get_summary
    summary = context_memory.get_summary("test_user")
    print(f"✅ get_summary() retorna: {summary}")
    
    # Cleanup
    context_memory.clear_context("test_user")
    print("✅ clear_context() funciona")
    
except ImportError as e:
    print(f"❌ Error importando: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

print("\n✅ TODOS LOS TESTS PASARON!")
