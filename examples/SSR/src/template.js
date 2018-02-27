export default ({ body }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      
      <body>
        <div id="root">${body}</div>
      </body>
      
      <script src="/dist/bundle.js"></script>
    </html>
  `
}
