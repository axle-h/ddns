

$env:GOOS="windows"; $env:GOARCH="amd64"; go install github.com/axle-h/ddns/ddns
$env:GOOS="darwin"; $env:GOARCH="amd64"; go install github.com/axle-h/ddns/ddns
$env:GOOS="linux"; $env:GOARCH="amd64"; go install github.com/axle-h/ddns/ddns
$env:GOOS="linux"; $env:GOARCH="arm"; go install github.com/axle-h/ddns/ddns

Remove-Item Env:\GOOS
Remove-Item Env:\GOARCH