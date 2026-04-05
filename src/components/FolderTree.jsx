import { useState } from 'react'

function buildTree(nodes) {
  const itemsById = new Map()
  const roots = []

  nodes.forEach((node) => {
    itemsById.set(node.id, { ...node, children: [] })
  })

  itemsById.forEach((node) => {
    if (node.parent_id && itemsById.has(node.parent_id)) {
      itemsById.get(node.parent_id).children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sorter = (left, right) => {
    if (left.type !== right.type) {
      return left.type === 'folder' ? -1 : 1
    }
    return left.name.localeCompare(right.name)
  }

  function sortRecursively(entries) {
    entries.sort(sorter)
    entries.forEach((entry) => sortRecursively(entry.children))
  }

  sortRecursively(roots)
  return roots
}

function LessonNode({ node, onToggle, onDelete, isSaving }) {
  return (
    <div className="lesson-row">
      <div className="lesson-row__main">
        <input
          type="checkbox"
          checked={Boolean(node.completed)}
          onChange={(event) => onToggle(node, event.target.checked)}
          disabled={isSaving}
          aria-label={`Mark ${node.name} as complete`}
        />
        <div className="lesson-row__label">
          <div>
            <strong>{node.name}</strong>
            <span>{node.completed ? 'Completed lesson' : 'Pending lesson'}</span>
          </div>
        </div>
      </div>
      <div className="tree-actions">
        {node.resource_url ? (
          <a href={node.resource_url} target="_blank" rel="noreferrer">
            Open resource
          </a>
        ) : (
          <span className="muted-copy">Stored locally</span>
        )}
        <button className="ghost-button" type="button" onClick={() => onDelete(node)} disabled={isSaving}>
          Remove
        </button>
      </div>
    </div>
  )
}

function FolderNode({ node, onToggle, onDelete, isSaving }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="tree-node">
      <div className="tree-node__row">
        <button className="tree-node__toggle" type="button" onClick={() => setIsExpanded((value) => !value)}>
          <span className="tree-node__label">
            <span aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>
            <div>
              <strong>{node.name}</strong>
              <span>{node.children.length} direct item(s)</span>
            </div>
          </span>
          <span className="muted-copy">{isExpanded ? 'Collapse' : 'Expand'}</span>
        </button>
        <div className="tree-actions">
          <button className="ghost-button" type="button" onClick={() => onDelete(node)} disabled={isSaving}>
            Remove folder
          </button>
        </div>
      </div>
      {isExpanded ? (
        <div className="tree-node__children">
          {node.children.map((child) =>
            child.type === 'folder' ? (
              <FolderNode
                key={child.id}
                node={child}
                onToggle={onToggle}
                onDelete={onDelete}
                isSaving={isSaving}
              />
            ) : (
              <LessonNode
                key={child.id}
                node={child}
                onToggle={onToggle}
                onDelete={onDelete}
                isSaving={isSaving}
              />
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}

export function FolderTree({ nodes, onToggle, onDelete, isSaving }) {
  const tree = buildTree(nodes)

  if (tree.length === 0) {
    return (
      <div className="empty-state">
        <h3>No course contents yet</h3>
        <p>Upload the course folder to generate the module tree and lessons.</p>
      </div>
    )
  }

  return (
    <div className="tree">
      {tree.map((node) =>
        node.type === 'folder' ? (
          <FolderNode
            key={node.id}
            node={node}
            onToggle={onToggle}
            onDelete={onDelete}
            isSaving={isSaving}
          />
        ) : (
          <LessonNode
            key={node.id}
            node={node}
            onToggle={onToggle}
            onDelete={onDelete}
            isSaving={isSaving}
          />
        ),
      )}
    </div>
  )
}
