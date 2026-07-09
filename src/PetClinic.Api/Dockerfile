FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 5210

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/PetClinic.Api/PetClinic.Api.csproj", "src/PetClinic.Api/"]
COPY ["src/PetClinic.Application/PetClinic.Application.csproj", "src/PetClinic.Application/"]
COPY ["src/PetClinic.Domain/PetClinic.Domain.csproj", "src/PetClinic.Domain/"]
COPY ["src/PetClinic.Infrastructure/PetClinic.Infrastructure.csproj", "src/PetClinic.Infrastructure/"]

RUN dotnet restore "src/PetClinic.Api/PetClinic.Api.csproj"

COPY . .
WORKDIR "/src/src/PetClinic.Api"
RUN dotnet build "PetClinic.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PetClinic.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PetClinic.Api.dll"]
