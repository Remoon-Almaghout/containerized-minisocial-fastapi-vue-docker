from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    DATABASE_URL: str = "sqlite:////app/data/app.db"
    JWT_SECRET: str = "change-me-super-secret"  
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MIN: int = 60
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_UPLOAD_EXT: str = "jpg,jpeg,png,webp"

    @property
    def allowed_exts(self):
        return {e.strip().lower() for e in self.ALLOWED_UPLOAD_EXT.split(",") if e.strip()}

settings = Settings()
