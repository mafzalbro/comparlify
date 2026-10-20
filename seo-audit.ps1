$script:pass = 0
$script:fail = 0
$script:skip = 0

function Head {
    param([string]$n)
    Write-Host ""
    Write-Host "--- $n ---" -ForegroundColor Cyan
}

function CheckSub {
    param(
        [string]$File,
        [string]$Needle,
        [string]$Name,
        [switch]$Not
    )
    if (-not (Test-Path $File)) {
        Write-Host "  SKIP: $Name -- file missing: $File" -ForegroundColor Yellow
        $script:skip = $script:skip + 1
        return
    }
    $c = Get-Content $File -Raw
    if ($null -eq $c) { $c = '' }
    $has = $c.Contains($Needle)
    if ($Not) { $has = -not $has }
    if ($has) {
        Write-Host "  PASS: $Name" -ForegroundColor Green
        $script:pass = $script:pass + 1
    } else {
        Write-Host "  FAIL: $Name" -ForegroundColor Red
        if ($Not) {
            Write-Host "         forbidden substring present in $File" -ForegroundColor Yellow
        } else {
            Write-Host "         missing substring in $File" -ForegroundColor Yellow
        }
        $script:fail = $script:fail + 1
    }
}

# ============================================================
Write-Host ""
Write-Host "COMPARLIFY SEO AUDIT" -ForegroundColor Cyan
Write-Host "Working dir: $PWD" -ForegroundColor DarkGray
# ============================================================

Head '1. Domain normalization'
CheckSub 'src/lib/seo.ts'     'www.comparlify.com'      'seo.ts uses www domain'
CheckSub 'src/lib/seo.ts'     'normalizeToCanonical'    'seo.ts has URL normalizer'
CheckSub 'src/app/sitemap.ts' 'www.comparlify.com'      'sitemap.ts uses www domain'
CheckSub 'src/app/robots.ts'  'www.comparlify.com'      'robots.ts uses www domain'
CheckSub 'public/llms.txt'    'www.comparlify.com'      'llms.txt uses www domain'
CheckSub 'public/llms.txt'    'comparlify.vercel.app'   'llms.txt has NO vercel.app' -Not

Head '2. Schema generators in seo.ts'
CheckSub 'src/lib/seo.ts' 'export function generateArticleSchema'             'Article schema generator'
CheckSub 'src/lib/seo.ts' 'export function generateFaqSchema'                 'FAQ schema generator'
CheckSub 'src/lib/seo.ts' 'export function generateBreadcrumbSchema'          'Breadcrumb schema generator'
CheckSub 'src/lib/seo.ts' 'export function generateSoftwareApplicationSchema' 'SoftwareApplication generator'

Head '3. JSON-LD helper component'
CheckSub 'src/components/json-ld.tsx' 'application/ld+json' 'JsonLd emits ld+json'

Head '4. Layout global schema'
CheckSub 'src/app/layout.tsx' 'WebSite'          'layout.tsx has WebSite schema'
CheckSub 'src/app/layout.tsx' 'Organization'     'layout.tsx has Organization schema'
CheckSub 'src/app/layout.tsx' 'www.comparlify.com' 'layout.tsx uses www'

Head '5. Homepage: no duplicate Organization'
CheckSub 'src\app\(main)\page.tsx' 'SchemaScript' 'page.tsx has NO SchemaScript' -Not

Head '6. Sitemap health'
CheckSub 'src/app/sitemap.ts' 'lastModified: new Date()' 'sitemap has NO bare new Date()' -Not
CheckSub 'src/app/sitemap.ts' 'isModuleEnabled("blog"'   'sitemap gates blog module'

Head '7. Robots.txt directives'
CheckSub 'src/app/robots.ts' '/admin/' 'robots disallows /admin/'
CheckSub 'src/app/robots.ts' '/api/'   'robots disallows /api/'
CheckSub 'src/app/robots.ts' 'sitemap' 'robots declares sitemap'

Head '8. Tools routing fixes'
CheckSub 'src/components/tools/ToolHubSearch.tsx'         'getToolBySlug'                'ToolHub uses getToolBySlug'
CheckSub 'src/components/tools/ToolHubSearch.tsx'         'matchedTool.id'               'ToolHub uses matchedTool.id'
CheckSub 'src/components/tools/ToolHubSearch.tsx'         'path:'                        'ToolHub entries have path field'
CheckSub 'src/components/tools/ToolSidebarInteractive.tsx' 'sub.path'                    'sidebar reads sub.path'
CheckSub 'src/components/tools/ToolSidebarInteractive.tsx' 'router.push(sub.path)'       'sidebar pushes sub.path'
CheckSub 'src/components/tools/ToolSidebarInteractive.tsx' '/tools/${selectedCategory}/${sub.slug}' 'sidebar OLD URL builder REMOVED' -Not

Head '9. Comparison structured data'
CheckSub 'src/components/comparison/comparison-detail-view.tsx' 'generateFaqSchema'          'detail-view: FaqSchema'
CheckSub 'src/components/comparison/comparison-detail-view.tsx' 'generateBreadcrumbSchema'   'detail-view: BreadcrumbSchema'
CheckSub 'src/components/comparison/comparison-detail-view.tsx' 'type: "article"'            'detail-view: article type'
CheckSub 'src/components/comparison/comparison-detail-view.tsx' 'JsonLd'                     'detail-view: JsonLd imported'
CheckSub 'src/components/comparison/comparison-vs-view.tsx'     'generateBreadcrumbSchema'   'vs-view: BreadcrumbSchema'
CheckSub 'src/components/comparison/comparison-vs-view.tsx'     'type: "article"'            'vs-view: article type'
CheckSub 'src/components/comparison/comparison-vs-view.tsx'     'JsonLd'                     'vs-view: JsonLd imported'

Head '10. Managed image alt enforcement'
CheckSub 'src/components/managed-image.tsx' 'console.warn' 'managed-image warns on missing alt'
CheckSub 'src/components/managed-image.tsx' 'NODE_ENV'     'managed-image guards in dev'

# ============================================================
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " SUMMARY" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ("  PASS: " + $script:pass) -ForegroundColor Green
Write-Host ("  FAIL: " + $script:fail) -ForegroundColor Red
Write-Host ("  SKIP: " + $script:skip) -ForegroundColor Yellow
Write-Host ""