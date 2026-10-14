const config = [
	{
		"Extension": ".aac",
		"MediaType": "audio/aac",
		"Description": "AAC audio"
	},
	{
		"Extension": ".abw",
		"MediaType": "application/x-abiword",
		"Description": "AbiWord document"
	},
	{
		"Extension": ".arc",
		"MediaType": "application/x-freearc",
		"Description": "Archive document (multiple files embedded)"
	},
	{
		"Extension": ".avif",
		"MediaType": "image/avif",
		"Description": "AVIF image"
	},
	{
		"Extension": ".avi",
		"MediaType": "video/x-msvideo",
		"Description": "AVI: Audio Video Interleave"
	},
	{
		"Extension": ".azw",
		"MediaType": "application/vnd.amazon.ebook",
		"Description": "Amazon Kindle eBook format"
	},
	{
		"Extension": ".bin",
		"MediaType": "application/octet-stream",
		"Description": "Any kind of binary data"
	},
	{
		"Extension": ".bmp",
		"MediaType": "image/bmp",
		"Description": "Windows OS/2 Bitmap Graphics"
	},
	{
		"Extension": ".bz",
		"MediaType": "application/x-bzip",
		"Description": "BZip archive"
	},
	{
		"Extension": ".bz2",
		"MediaType": "application/x-bzip2",
		"Description": "BZip2 archive"
	},
	{
		"Extension": ".cda",
		"MediaType": "application/x-cdf",
		"Description": "CD audio"
	},
	{
		"Extension": ".csh",
		"MediaType": "application/x-csh",
		"Description": "C-Shell script"
	},
	{
		"Extension": ".css",
		"MediaType": "text/css",
		"Description": "Cascading Style Sheets (CSS)"
	},
	{
		"Extension": ".csv",
		"MediaType": "text/csv",
		"Description": "Comma-separated values (CSV)"
	},
	{
		"Extension": ".doc",
		"MediaType": "application/msword",
		"Description": "Microsoft Word"
	},
	{
		"Extension": ".docx",
		"MediaType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"Description": "Microsoft Word (OpenXML)"
	},
	{
		"Extension": ".eot",
		"MediaType": "application/vnd.ms-fontobject",
		"Description": "MS Embedded OpenType fonts"
	},
	{
		"Extension": ".epub",
		"MediaType": "application/epub+zip",
		"Description": "Electronic publication (EPUB)"
	},
	{
		"Extension": ".gz",
		"MediaType": "application/gzip",
		"Description": "GZip Compressed Archive"
	},
	{
		"Extension": ".gif",
		"MediaType": "image/gif",
		"Description": "Graphics Interchange Format (GIF)"
	},
	{
		"Extension": ".htm, .html",
		"MediaType": "text/html",
		"Description": "HyperText Markup Language (HTML)"
	},
	{
		"Extension": ".ico",
		"MediaType": "image/vnd.microsoft.icon",
		"Description": "Icon format"
	},
	{
		"Extension": ".ics",
		"MediaType": "text/calendar",
		"Description": "iCalendar format"
	},
	{
		"Extension": ".jar",
		"MediaType": "application/java-archive",
		"Description": "Java Archive (JAR)"
	},
	{
		"Extension": ".jpeg,.jpg",
		"MediaType": "image/jpeg",
		"Description": "JPEG images"
	},
	{
		"Extension": ".js",
		"MediaType": "text/javascript (Specifications: HTML and RFC 9239)",
		"Description": "JavaScript"
	},
	{
		"Extension": ".json",
		"MediaType": "application/json",
		"Description": "JSON format"
	},
	{
		"Extension": ".jsonld",
		"MediaType": "application/ld+json",
		"Description": "JSON-LD format"
	},
	{
		"Extension": ".mid, .midi",
		"MediaType": "audio/midi, audio/x-midi",
		"Description": "Musical Instrument Digital Interface (MIDI)"
	},
	{
		"Extension": ".mjs",
		"MediaType": "text/javascript",
		"Description": "JavaScript module"
	},
	{
		"Extension": ".mp3",
		"MediaType": "audio/mpeg",
		"Description": "MP3 audio"
	},
	{
		"Extension": ".mp4",
		"MediaType": "video/mp4",
		"Description": "MP4 video"
	},
	{
		"Extension": ".mpeg",
		"MediaType": "video/mpeg",
		"Description": "MPEG Video"
	},
	{
		"Extension": ".mpkg",
		"MediaType": "application/vnd.apple.installer+xml",
		"Description": "Apple Installer Package"
	},
	{
		"Extension": ".odp",
		"MediaType": "application/vnd.oasis.opendocument.presentation",
		"Description": "OpenDocument presentation document"
	},
	{
		"Extension": ".ods",
		"MediaType": "application/vnd.oasis.opendocument.spreadsheet",
		"Description": "OpenDocument spreadsheet document"
	},
	{
		"Extension": ".odt",
		"MediaType": "application/vnd.oasis.opendocument.text",
		"Description": "OpenDocument text document"
	},
	{
		"Extension": ".oga",
		"MediaType": "audio/ogg",
		"Description": "OGG audio"
	},
	{
		"Extension": ".ogv",
		"MediaType": "video/ogg",
		"Description": "OGG video"
	},
	{
		"Extension": ".ogx",
		"MediaType": "application/ogg",
		"Description": "OGG"
	},
	{
		"Extension": ".opus",
		"MediaType": "audio/opus",
		"Description": "Opus audio"
	},
	{
		"Extension": ".otf",
		"MediaType": "font/otf",
		"Description": "OpenType font"
	},
	{
		"Extension": ".png",
		"MediaType": "image/png",
		"Description": "Portable Network Graphics"
	},
	{
		"Extension": ".pdf",
		"MediaType": "application/pdf",
		"Description": "Adobe Portable Document Format (PDF)"
	},
	{
		"Extension": ".php",
		"MediaType": "application/x-httpd-php",
		"Description": "Hypertext Preprocessor (Personal Home Page)"
	},
	{
		"Extension": ".ppt",
		"MediaType": "application/vnd.ms-powerpoint",
		"Description": "Microsoft PowerPoint"
	},
	{
		"Extension": ".pptx",
		"MediaType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"Description": "Microsoft PowerPoint (OpenXML)"
	},
	{
		"Extension": ".rar",
		"MediaType": "application/vnd.rar",
		"Description": "RAR archive"
	},
	{
		"Extension": ".rtf",
		"MediaType": "application/rtf",
		"Description": "Rich Text Format (RTF)"
	},
	{
		"Extension": ".sh",
		"MediaType": "application/x-sh",
		"Description": "Bourne shell script"
	},
	{
		"Extension": ".svg",
		"MediaType": "image/svg+xml",
		"Description": "Scalable Vector Graphics (SVG)"
	},
	{
		"Extension": ".tar",
		"MediaType": "application/x-tar",
		"Description": "Tape Archive (TAR)"
	},
	{
		"Extension": ".tif, .tiff",
		"MediaType": "image/tiff",
		"Description": "Tagged Image File Format (TIFF)"
	},
	{
		"Extension": ".ts",
		"MediaType": "video/mp2t",
		"Description": "MPEG transport stream"
	},
	{
		"Extension": ".ttf",
		"MediaType": "font/ttf",
		"Description": "TrueType Font"
	},
	{
		"Extension": ".txt",
		"MediaType": "text/plain",
		"Description": "Text, (generally ASCII or ISO 8859-n)"
	},
	{
		"Extension": ".vsd",
		"MediaType": "application/vnd.visio",
		"Description": "Microsoft Visio"
	},
	{
		"Extension": ".wav",
		"MediaType": "audio/wav",
		"Description": "Waveform Audio Format"
	},
	{
		"Extension": ".weba",
		"MediaType": "audio/webm",
		"Description": "WEBM audio"
	},
	{
		"Extension": ".webm",
		"MediaType": "video/webm",
		"Description": "WEBM video"
	},
	{
		"Extension": ".webp",
		"MediaType": "image/webp",
		"Description": "WEBP image"
	},
	{
		"Extension": ".woff",
		"MediaType": "font/woff",
		"Description": "Web Open Font Format (WOFF)"
	},
	{
		"Extension": ".woff2",
		"MediaType": "font/woff2",
		"Description": "Web Open Font Format (WOFF)"
	},
	{
		"Extension": ".xhtml",
		"MediaType": "application/xhtml+xml",
		"Description": "XHTML"
	},
	{
		"Extension": ".xls",
		"MediaType": "application/vnd.ms-excel",
		"Description": "Microsoft Excel"
	},
	{
		"Extension": ".xlsx",
		"MediaType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"Description": "Microsoft Excel (OpenXML)"
	},
	{
		"Extension": ".xml",
		"MediaType": "application/xml",
		"Description": "XML"
	},
	{
		"Extension": ".xul",
		"MediaType": "application/vnd.mozilla.xul+xml",
		"Description": "XUL"
	},
	{
		"Extension": ".zip",
		"MediaType": "application/x-zip-compressed",
		"Description": "ZIP archive"
	},
	{
		"Extension": ".3gp",
		"MediaType": "video/3gpp; audio/3gpp if it doesn't contain video",
		"Description": "3GPP audio/video container"
	},
	{
		"Extension": ".3g2",
		"MediaType": "video/3gpp2; audio/3gpp2 if it doesn't contain video",
		"Description": "3GPP2 audio/video container"
	},
	{
		"Extension": ".7z",
		"MediaType": "application/x-7z-compressed",
		"Description": "7-zip archive"
	},
	{
		"Extension": ".rdf",
		"MediaType": "application/rdf+xml",
		"Description": "RDF/XML"
	},
	{
		"Extension": ".xml",
		"MediaType": "text/xml",
		"Description": "XML"
	}
]

function GetExtensionFile(mediaType) {
	var data = config.filter(x => x.MediaType.toLowerCase() == mediaType.toLowerCase());
	var extension = data != null && data.length > 0 ? data[0].Extension : 'Not found';
	return extension;
}

function GetMediaType(extension) {
	var data = config.filter(x => x.Extension.toLowerCase() == extension.toLowerCase());
	var mediaType = data != null && data.length > 0 ? data[0].MediaType : 'Not found';
	return mediaType;
}