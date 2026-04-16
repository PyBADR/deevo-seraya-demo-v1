from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM provider
    LLM_PROVIDER: str = "deterministic"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4.1-mini"
    LMSTUDIO_BASE_URL: str = "http://localhost:1234/v1"
    LMSTUDIO_MODEL: str = "local-model"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # Database
    DATABASE_URL: str = ""
    MONGODB_URL: str = "mongodb://localhost:27017"
    REDIS_URL: str = "redis://localhost:6379"

    # API security
    DEEVO_API_KEY: str = ""

    # App
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
