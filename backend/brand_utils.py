
def extract_brand_name(soup, default_title: str) -> str:
    # 1. Try Open Graph Site Name
    og_site_name = soup.find('meta', property='og:site_name')
    if og_site_name and og_site_name.get('content'):
        return og_site_name.get('content').strip()
    
    # 2. Try JSON-LD (Search for Organization)
    import json
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            if not script.string: continue
            data = json.loads(script.string)
            
            def check_org(d):
                if isinstance(d, dict) and d.get('@type') == 'Organization' and d.get('name'):
                    return d.get('name')
                return None

            if isinstance(data, dict):
                res = check_org(data)
                if res: return res
                if '@graph' in data:
                    for item in data['@graph']:
                        res = check_org(item)
                        if res: return res
        except:
            pass

    # 3. Clean Title Heuristic
    if default_title:
        # Common separators in page titles
        separators = ['|', '-', '—', ':', '•', '–', '«', '»']
        best_candidate = default_title
        
        for sep in separators:
            if sep in default_title:
                parts = [p.strip() for p in default_title.split(sep) if p.strip()]
                if not parts: continue
                
                # Usually the brand name is the shortest part, often at the end or beginning
                # Filter out very long parts (descriptions)
                candidates = [p for p in parts if len(p) < 40] 
                
                if candidates:
                    # Pick the shortest one as likely brand name
                    best_candidate = min(candidates, key=len)
                    return best_candidate
                    
    return default_title
