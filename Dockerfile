FROM php:8.1-fpm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    curl

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath xml

COPY . /var/www/html

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
