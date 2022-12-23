# Configureing Apache 2 http server

The base configuration directory for apache 2 on ubuntu is usually
```
/etc/apache2
```
The configured root for web files
```
/var/www
```
 
## Configure mod_rewrite for the apache web server
 
Angular applications control links internally. As a consequence you cannot use deep links in the production environment (it works for the development). To solve it, you may use the features of the apache web-server to redirect any deep links to the app.
 
### Enable mod_rewrite in Apache 2
 
Enabling the module with a2enmod and restart apache (it will copy the rewrite.load file in the mods-enabled directory):
```
sudo a2enmod rewrite
sudo systemctl restart apache2
```
 
Now enable the usage of .htaccess file for the virtual host you are using it is by default in ./sites-available/000-default.conf
```
sudo nano /etc/apache2/sites-available/000-default.conf
```
now copy the following code directly in front of the closing tag \<VirtualHost>
```
<Directory /var/www/html>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
</Directory>
```
now restart apache2 again:
```
sudo systemctl restart apache2
```
Now place a ".htaccess" file in your directory (e.g. /var/www/html)
```
sudo nano /var/www/html/.htaccess
```
 
```
<IfModule mod_rewrite.c>
    RewriteEngine on
 
    # Don't rewrite files or directories
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
 
    # Rewrite everything else to index.html
    # to allow html5 state links
    RewriteRule ^appname index.html [L]
</IfModule>
```
 
## Configure Apache as a proxy
 
Enable modules:
```
sudo a2enmod proxy
sudo a2enmod proxy_http
```
 
Configure 000-default.conf configuration file with (for the example of redirecting /api/v1 calls to a rest service)
 
```
ProxyPass /api/v1 http://localhost:8002/api/v1
ProxyPassReverse /api/v1 http://localhost:8002/api/v1
```

## Use Apache to add CORS headers

Activate the headers module
```
sudo a2enmod headers
sudo systemctl restart apache2
```

Add a .htaccess file in the root directory (e.g. /var/www/html) of the web-content with:
```
Header add Access-Control-Allow-Origin "*"
Header add Access-Control-Allow-Headers "origin, x-requested-with, content-type"
Header add Access-Control-Allow-Methods "PUT, GET, POST, DELETE, OPTIONS"
```