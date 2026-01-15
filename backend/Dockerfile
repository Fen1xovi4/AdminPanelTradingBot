# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy NuGet config to override local settings
COPY NuGet.Config ./

# Copy solution and project files
COPY AdminPanel.sln ./
COPY Directory.Build.props ./
COPY src/BotsForTrading.Api/BotsForTrading.Api.csproj src/BotsForTrading.Api/
COPY src/BotsForTrading.Core/BotsForTrading.Core.csproj src/BotsForTrading.Core/
COPY src/BotsForTrading.Infrastructure/BotsForTrading.Infrastructure.csproj src/BotsForTrading.Infrastructure/
COPY src/BotsForTrading.Shared/BotsForTrading.Shared.csproj src/BotsForTrading.Shared/

# Restore dependencies
RUN dotnet restore --configfile NuGet.Config

# Copy all source files
COPY src/ src/

# Build and publish
WORKDIR /src/src/BotsForTrading.Api
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user and data directories with correct permissions
RUN useradd -m -u 1000 appuser \
    && mkdir -p /app/Data/BotStates /app/logs \
    && chown -R appuser:appuser /app

COPY --from=build --chown=appuser:appuser /app/publish .

USER appuser

EXPOSE 5000

ENTRYPOINT ["dotnet", "BotsForTrading.Api.dll"]
