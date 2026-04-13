# --- STAGE 1: Frontend Build ---
FROM node:20-slim as frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# --- STAGE 2: Backend Build ---
FROM ruby:4.0.0-slim as base
WORKDIR /rails
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

FROM base as build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git pkg-config
COPY backend/Gemfile backend/Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git
COPY backend/ .

# --- STAGE 3: Final Production Image ---
FROM base
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libsqlite3-0 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /rails /rails
# Copy frontend build from Stage 1 into backend public folder
COPY --from=frontend-build /app/dist /rails/public

RUN useradd rails --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp
USER rails:rails

EXPOSE 3000
CMD ["./bin/rails", "server", "-b", "0.0.0.0"]
