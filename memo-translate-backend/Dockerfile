# 第一阶段：构建
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# 先复制 pom.xml 并下载依赖（利用 Docker 缓存）
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码并构建
COPY src ./src
RUN mvn clean package -DskipTests -B

# 第二阶段：运行
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 从构建阶段复制 jar 包
COPY --from=builder /build/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 运行应用
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
