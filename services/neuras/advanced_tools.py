"""
ECONEURA Advanced Tools System
Funcionalidades avanzadas para agentes: búsqueda web, análisis archivos, código, etc.
Inspirado en GitHub Copilot capabilities
"""
import os
import httpx
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import base64
import tempfile
import subprocess

class AdvancedTools:
    """Sistema de herramientas avanzadas para agentes ECONEURA"""
    
    def __init__(self):
        self.bing_key = os.getenv("BING_SEARCH_API_KEY", "")
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        self.enable_code_exec = os.getenv("ENABLE_CODE_EXECUTION", "true").lower() == "true"
        self.code_timeout = int(os.getenv("CODE_EXECUTION_TIMEOUT", "30"))
        
    async def web_search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """
        Búsqueda web usando Bing Search API
        Similar a la capacidad de Copilot de buscar información actualizada
        """
        if not self.bing_key:
            return [{"error": "Bing Search API key not configured"}]
        
        try:
            headers = {"Ocp-Apim-Subscription-Key": self.bing_key}
            params = {"q": query, "count": num_results, "mkt": "es-ES"}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.bing.microsoft.com/v7.0/search",
                    headers=headers,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    
                    for item in data.get("webPages", {}).get("value", [])[:num_results]:
                        results.append({
                            "title": item.get("name"),
                            "url": item.get("url"),
                            "snippet": item.get("snippet"),
                            "date": item.get("dateLastCrawled")
                        })
                    
                    return results
                else:
                    return [{"error": f"Bing API error: {response.status_code}"}]
                    
        except Exception as e:
            return [{"error": f"Web search failed: {str(e)}"}]
    
    async def analyze_file(self, file_content: str, file_type: str) -> Dict[str, Any]:
        """
        Analiza archivos (código, docs, imágenes, etc.)
        Similar a la capacidad de Copilot de analizar contexto de archivos
        """
        analysis = {
            "file_type": file_type,
            "size_bytes": len(file_content),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Análisis según tipo de archivo
        if file_type in ["py", "js", "ts", "java", "cpp"]:
            analysis["analysis_type"] = "code"
            analysis["lines"] = len(file_content.split("\n"))
            analysis["functions"] = self._count_functions(file_content, file_type)
            analysis["imports"] = self._extract_imports(file_content, file_type)
            
        elif file_type in ["md", "txt", "rst"]:
            analysis["analysis_type"] = "documentation"
            analysis["word_count"] = len(file_content.split())
            analysis["headings"] = self._extract_headings(file_content)
            
        elif file_type in ["json", "yaml", "toml"]:
            analysis["analysis_type"] = "configuration"
            try:
                parsed = json.loads(file_content) if file_type == "json" else {}
                analysis["keys"] = list(parsed.keys()) if isinstance(parsed, dict) else []
            except:
                analysis["parse_error"] = True
                
        else:
            analysis["analysis_type"] = "generic"
        
        return analysis
    
    def _count_functions(self, content: str, file_type: str) -> int:
        """Cuenta funciones en código"""
        patterns = {
            "py": ["def ", "async def "],
            "js": ["function ", "const ", "let ", "=> "],
            "ts": ["function ", "const ", "let ", "=> "],
            "java": ["public ", "private ", "protected "],
            "cpp": ["void ", "int ", "bool ", "auto "]
        }
        
        count = 0
        for pattern in patterns.get(file_type, []):
            count += content.count(pattern)
        return count
    
    def _extract_imports(self, content: str, file_type: str) -> List[str]:
        """Extrae imports/requires"""
        imports = []
        lines = content.split("\n")
        
        for line in lines[:50]:  # Solo primeras 50 líneas
            if file_type == "py" and ("import " in line or "from " in line):
                imports.append(line.strip())
            elif file_type in ["js", "ts"] and ("import " in line or "require(" in line):
                imports.append(line.strip())
        
        return imports[:10]  # Max 10 imports
    
    def _extract_headings(self, content: str) -> List[str]:
        """Extrae headings de markdown"""
        headings = []
        for line in content.split("\n"):
            if line.startswith("#"):
                headings.append(line.strip())
        return headings[:20]  # Max 20 headings
    
    async def execute_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Ejecuta código en sandbox seguro
        Similar a la capacidad de Copilot de ejecutar y validar código
        """
        if not self.enable_code_exec:
            return {"error": "Code execution disabled", "output": None}
        
        result = {
            "language": language,
            "executed_at": datetime.utcnow().isoformat(),
            "success": False,
            "output": "",
            "error": None
        }
        
        try:
            if language == "python":
                # Crear archivo temporal
                with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                    f.write(code)
                    temp_file = f.name
                
                # Ejecutar con timeout
                process = subprocess.run(
                    ["python", temp_file],
                    capture_output=True,
                    text=True,
                    timeout=self.code_timeout
                )
                
                result["output"] = process.stdout
                result["success"] = process.returncode == 0
                
                if process.stderr:
                    result["error"] = process.stderr
                
                # Limpiar archivo temporal
                os.unlink(temp_file)
                
            elif language == "javascript":
                # Node.js execution
                with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                    f.write(code)
                    temp_file = f.name
                
                process = subprocess.run(
                    ["node", temp_file],
                    capture_output=True,
                    text=True,
                    timeout=self.code_timeout
                )
                
                result["output"] = process.stdout
                result["success"] = process.returncode == 0
                
                if process.stderr:
                    result["error"] = process.stderr
                
                os.unlink(temp_file)
            else:
                result["error"] = f"Language {language} not supported"
                
        except subprocess.TimeoutExpired:
            result["error"] = f"Code execution timeout ({self.code_timeout}s)"
        except Exception as e:
            result["error"] = f"Execution failed: {str(e)}"
        
        return result
    
    async def github_search(self, query: str, repo: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Búsqueda en GitHub repositories
        Similar a la integración de Copilot con GitHub
        """
        if not self.github_token:
            return [{"error": "GitHub token not configured"}]
        
        try:
            headers = {
                "Authorization": f"token {self.github_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            # Buscar código
            search_url = "https://api.github.com/search/code"
            params = {"q": query}
            
            if repo:
                params["q"] += f" repo:{repo}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    search_url,
                    headers=headers,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    
                    for item in data.get("items", [])[:5]:
                        results.append({
                            "name": item.get("name"),
                            "path": item.get("path"),
                            "repository": item.get("repository", {}).get("full_name"),
                            "url": item.get("html_url"),
                            "score": item.get("score")
                        })
                    
                    return results
                else:
                    return [{"error": f"GitHub API error: {response.status_code}"}]
                    
        except Exception as e:
            return [{"error": f"GitHub search failed: {str(e)}"}]
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """
        Lista de herramientas disponibles para Azure OpenAI Functions
        Formato compatible con Azure OpenAI function calling
        """
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Buscar información actualizada en Internet usando Bing Search",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Consulta de búsqueda"
                            },
                            "num_results": {
                                "type": "integer",
                                "description": "Número de resultados (1-10)",
                                "default": 5
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "analyze_file",
                    "description": "Analizar contenido de archivos (código, documentos, configuraciones)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "file_content": {
                                "type": "string",
                                "description": "Contenido del archivo"
                            },
                            "file_type": {
                                "type": "string",
                                "description": "Extensión del archivo (py, js, md, etc.)"
                            }
                        },
                        "required": ["file_content", "file_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "execute_code",
                    "description": "Ejecutar código Python o JavaScript en sandbox seguro",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "code": {
                                "type": "string",
                                "description": "Código a ejecutar"
                            },
                            "language": {
                                "type": "string",
                                "enum": ["python", "javascript"],
                                "description": "Lenguaje de programación"
                            }
                        },
                        "required": ["code", "language"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "github_search",
                    "description": "Buscar código y repositorios en GitHub",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Consulta de búsqueda"
                            },
                            "repo": {
                                "type": "string",
                                "description": "Repositorio específico (owner/repo)",
                                "default": None
                            }
                        },
                        "required": ["query"]
                    }
                }
            }
        ]
        
        return tools
    
    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """
        Ejecuta una herramienta por nombre
        Usado cuando Azure OpenAI solicita function calling
        """
        if tool_name == "web_search":
            return await self.web_search(**arguments)
        elif tool_name == "analyze_file":
            return await self.analyze_file(**arguments)
        elif tool_name == "execute_code":
            return await self.execute_code(**arguments)
        elif tool_name == "github_search":
            return await self.github_search(**arguments)
        else:
            return {"error": f"Unknown tool: {tool_name}"}


# Singleton instance
advanced_tools = AdvancedTools()
