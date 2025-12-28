class FileController < ApplicationController
  # Vulnerable: Header with string interpolation from params
  def download
    filename = params[:filename]
    # <expect-error>
    response.headers['Content-Disposition'] = "attachment; filename=#{filename}"
    send_file "/uploads/#{filename}"
  end

  # Vulnerable: Direct params interpolation in header
  def custom_header
    value = params[:custom_value]
    # <expect-error>
    response.headers['X-Custom-Header'] = "value: #{value}"
  end

  # Vulnerable: redirect_to with params directly
  def redirect
    # <expect-error>
    redirect_to params[:url]
  end

  # Vulnerable: redirect_to with params access
  def redirect_unsafe
    # <expect-error>
    redirect_to params.fetch(:destination, '/')
  end

  # <no-error> - Static header value
  def safe_static_header
    response.headers['Content-Type'] = 'application/pdf'
  end

  # <no-error> - Using Rails send_file properly
  def safe_download
    safe_filename = sanitize_filename(params[:filename])
    send_file path, filename: safe_filename, disposition: 'attachment'
  end

  # <no-error> - Sanitized value
  def safe_header
    sanitized = params[:value].to_s.gsub(/[\r\n\x00]/, '')
    response.headers['X-Safe'] = sanitized
  end

  # <no-error> - Whitelisted redirect
  def safe_redirect
    allowed_urls = %w[/home /dashboard /profile]
    url = params[:url]
    redirect_to url if allowed_urls.include?(url)
  end

  private

  def sanitize_filename(name)
    File.basename(name.to_s.gsub(/[\r\n\x00]/, ''))
  end
end
