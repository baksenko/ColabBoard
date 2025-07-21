FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["ColabBoard.Web/ColabBoard.Web.csproj", "ColabBoard.Web/"]
COPY ["ColabBoard.Application/ColabBoard.Application.csproj", "ColabBoard.Application/"]
COPY ["ColabBoard.Domain/ColabBoard.Domain.csproj", "ColabBoard.Domain/"]
COPY ["ColabBoard.Infrastructure/ColabBoard.Infrastructure.csproj", "ColabBoard.Infrastructure/"]
RUN dotnet restore "ColabBoard.Web/ColabBoard.Web.csproj"
COPY . .
WORKDIR "/src/ColabBoard.Web"
RUN dotnet build "./ColabBoard.Web.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ColabBoard.Web.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ColabBoard.Web.dll"]
