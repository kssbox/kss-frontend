

``` sql
# kbId='8180da54-9c0c-48aa-85aa-734c1da646e'
select * from chatbot.file_data where file_data_id='fd5c3fe1-486f-4bfb-8ba1-2b91baa12e3a';

# doc_id = '134982846929522689'
select * from chatbot.data2doc where data_id ='fd5c3fe1-486f-4bfb-8ba1-2b91baa12e3a';

# session_id ='134982846925328384'  kbId='123691964838268928'
select * from rag.document where id='134982846929522689';
select * from rag.document_session where id ='134982846925328384';

select * from rag.session_range where session_id ='134982846925328384';
select * from rag.chunk where session_id='134982846925328384';

SELECT
    d2d.data_id,
    d2d.doc_id,  -- 从 data2doc 表取 doc_id
    doc.kb_id,    -- 从 document 表取 kb_id
    doc.session_id  -- 从 document 表取 session_id
FROM chatbot.data2doc d2d
         LEFT JOIN rag.document doc ON d2d.doc_id = doc.id  -- 核心关联条件：doc_id = document.id
WHERE d2d.data_id = 'fd5c3fe1-486f-4bfb-8ba1-2b91baa12e3a';  -- 输入的 data_id
```


``` bash
curl http://127.0.0.1:8800/v1/knowledge_bases/list | jq .


# POST /knowledge_bases/{kb_id}/documents/{doc_id}/ranges/{range_id}/edit



curl -X POST http://127.0.0.1:8800/v1/knowledge_bases/808508566414643200/documents/batch_query | jq .



# GET  /knowledge_bases/{kb_id}/documents/{doc_id}/ranges
curl -X GET "http://127.0.0.1:8800/v1/knowledge_bases/123691964838268928/documents/808508566414643200/ranges" | jq .
```