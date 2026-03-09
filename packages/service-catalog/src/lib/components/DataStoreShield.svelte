<script lang="ts">
  import type { DataStoreType } from '@cwygoda/service-catalog/domain';
  import Shield from './Shield.svelte';

  interface Props {
    type: DataStoreType;
    technology?: string | undefined;
    size?: number;
  }

  let { type, technology, size = 40 }: Props = $props();

  const typeLabels: Record<DataStoreType, { short: string; full: string }> = {
    database: { short: 'Db', full: 'Database' },
    cache: { short: 'Ca', full: 'Cache' },
    queue: { short: 'Qu', full: 'Queue' },
    'search-index': { short: 'Si', full: 'Search Index' },
    'object-store': { short: 'Os', full: 'Object Store' },
  };

  const techLabels: Record<string, { short: string; full: string } | undefined> = {
    postgresql: { short: 'Pg', full: 'PostgreSQL' },
    postgres: { short: 'Pg', full: 'PostgreSQL' },
    'rds postgresql': { short: 'Pg', full: 'PostgreSQL' },
    mysql: { short: 'My', full: 'MySQL' },
    'rds mysql': { short: 'My', full: 'MySQL' },
    mariadb: { short: 'Ma', full: 'MariaDB' },
    mongodb: { short: 'Mg', full: 'MongoDB' },
    redis: { short: 'Re', full: 'Redis' },
    elasticache: { short: 'Re', full: 'ElastiCache' },
    memcached: { short: 'Mc', full: 'Memcached' },
    elasticsearch: { short: 'Es', full: 'Elasticsearch' },
    opensearch: { short: 'Os', full: 'OpenSearch' },
    s3: { short: 'S3', full: 'Amazon S3' },
    'amazon s3': { short: 'S3', full: 'Amazon S3' },
    dynamodb: { short: 'Dy', full: 'DynamoDB' },
    kafka: { short: 'Kf', full: 'Kafka' },
    rabbitmq: { short: 'Rq', full: 'RabbitMQ' },
    sqs: { short: 'Sq', full: 'Amazon SQS' },
    'amazon sqs': { short: 'Sq', full: 'Amazon SQS' },
    sqlite: { short: 'Sl', full: 'SQLite' },
  };

  let entry = $derived.by(() => {
    if (technology) {
      const match = techLabels[technology.toLowerCase()];
      if (match) return match;
    }
    return typeLabels[type];
  });

  let tooltip = $derived(
    technology && entry.full !== technology
      ? `${entry.full} (${typeLabels[type].full})`
      : entry.full
  );
</script>

<span class="group relative inline-flex" title={tooltip}>
  <Shield label={entry.short} {size} />
  <span
    role="tooltip"
    class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-gray-100 dark:text-gray-900"
  >
    {tooltip}
  </span>
</span>
